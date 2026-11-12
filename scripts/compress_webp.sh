#!/usr/bin/env bash

set -euo pipefail

# Detect available compression tool
CONVERTER=""
if command -v cwebp >/dev/null 2>&1; then
    CONVERTER="cwebp"
elif command -v ffmpeg >/dev/null 2>&1; then
    CONVERTER="ffmpeg"
elif command -v python3 >/dev/null 2>&1 && python3 -c "import PIL" 2>/dev/null; then
    CONVERTER="python"
else
    echo "[ERRO] Nenhuma ferramenta de compressão encontrada (cwebp, ffmpeg ou python3-pillow)."
    echo "Instale cwebp (sudo apt install webp) ou ffmpeg (sudo apt install ffmpeg)."
    exit 1
fi

INPUT_PATH="."
QUALITY="50"

# Command line arguments support
if [ $# -ge 1 ]; then
    INPUT_PATH="$1"
    if [ $# -ge 2 ]; then
        QUALITY="$2"
    fi
else
    read -rp "Informe a pasta ou arquivo de entrada [padrão: .]: " user_input
    if [ -n "$user_input" ]; then
        INPUT_PATH="$user_input"
    fi

    read -rp "Qual o nível de qualidade? (0-100) [padrão: 50]: " user_quality
    if [ -n "$user_quality" ]; then
        QUALITY="$user_quality"
    fi
fi

if ! [[ "$QUALITY" =~ ^[0-9]+$ ]] || [ "$QUALITY" -gt 100 ] || [ "$QUALITY" -lt 0 ]; then
    echo "[ERRO] Qualidade inválida ($QUALITY). Deve ser um número entre 0 e 100."
    exit 1
fi

if [ ! -e "$INPUT_PATH" ]; then
    echo "[ERRO] Caminho não encontrado: $INPUT_PATH"
    exit 1
fi

# Collect files
FILES=()
if [ -f "$INPUT_PATH" ]; then
    FILES+=("$INPUT_PATH")
elif [ -d "$INPUT_PATH" ]; then
    while IFS= read -r -d '' f; do
        FILES+=("$f")
    done < <(find "$INPUT_PATH" -maxdepth 1 -type f \( \
        -iname "*.png" -o \
        -iname "*.jpg" -o \
        -iname "*.jpeg" -o \
        -iname "*.webp" \
    \) -print0 | sort -z)
fi

TOTAL=${#FILES[@]}
if [ "$TOTAL" -eq 0 ]; then
    echo "[AVISO] Nenhuma imagem (PNG, JPG, WEBP) encontrada em: $INPUT_PATH"
    exit 0
fi

echo "Iniciando compressão de $TOTAL imagem(ns) para WebP com qualidade $QUALITY (usando $CONVERTER)..."

ACTIVE_TEMP_FILE=""

cleanup_temp_file() {
    if [ -n "$ACTIVE_TEMP_FILE" ] && [ -f "$ACTIVE_TEMP_FILE" ]; then
        rm -f "$ACTIVE_TEMP_FILE"
    fi
    ACTIVE_TEMP_FILE=""
}

trap cleanup_temp_file EXIT INT TERM

compress_image() {
    local src="$1"
    local dir
    local filename
    local basename
    local dest

    dir="$(dirname "$src")"
    filename="$(basename "$src")"
    basename="${filename%.*}"
    dest="$dir/${basename}.webp"

    # Temporary file if source is already a .webp with the same target name
    local temp_dest="$dest"
    local in_place=false
    if [ "$src" = "$dest" ]; then
        in_place=true
        temp_dest="$dir/.${basename}_tmp_$$.webp"
        ACTIVE_TEMP_FILE="$temp_dest"
    fi

    local status=0
    case "$CONVERTER" in
        cwebp)
            cwebp -q "$QUALITY" "$src" -o "$temp_dest" -quiet || status=$?
            ;;
        ffmpeg)
            ffmpeg -y -v error -i "$src" -c:v libwebp -quality "$QUALITY" "$temp_dest" || status=$?
            ;;
        python)
            python3 - "$src" "$temp_dest" "$QUALITY" <<'PY' || status=$?
import sys
from PIL import Image

src, temp_dest, quality_arg = sys.argv[1:4]
img = Image.open(src)
img.save(temp_dest, "WEBP", quality=int(quality_arg), method=4)
PY
            ;;
    esac

    if [ "$status" -ne 0 ]; then
        if [ "$in_place" = true ]; then
            cleanup_temp_file
        fi
        return "$status"
    fi

    if [ "$in_place" = true ]; then
        mv -f "$temp_dest" "$dest"
        ACTIVE_TEMP_FILE=""
    fi
}

SUCCESS=0
FAILED=0
CURRENT=0

for img in "${FILES[@]}"; do
    CURRENT=$((CURRENT + 1))
    name=$(basename "$img")
    printf " [%3d/%3d] Comprimindo: %-40s " "$CURRENT" "$TOTAL" "$name"

    if compress_image "$img"; then
        echo "✓ Concluído"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "✗ Falhou"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "Concluído! $SUCCESS imagem(ns) comprimida(s) com sucesso."
if [ "$FAILED" -gt 0 ]; then
    echo "Falhas: $FAILED"
fi
