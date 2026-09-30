#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' 

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}       Conversor de Imagens PNG para WEBP           ${NC}"
echo -e "${CYAN}====================================================${NC}"

CONVERTER=""
if command -v ffmpeg >/dev/null 2>&1; then
    CONVERTER="ffmpeg"
elif command -v cwebp >/dev/null 2>&1; then
    CONVERTER="cwebp"
elif command -v python3 >/dev/null 2>&1 && python3 -c "import PIL" 2>/dev/null; then
    CONVERTER="python"
else
    echo -e "${RED}[ERRO] Nenhuma ferramenta de conversão encontrada (ffmpeg, cwebp ou python3-pillow).${NC}"
    echo "Instale o ffmpeg com: sudo apt update && sudo apt install -y ffmpeg"
    exit 1
fi

echo -e "${BLUE}[INFO] Motor de conversão detectado: ${GREEN}${CONVERTER}${NC}\n"

INPUT_DIR="."
OUTPUT_DIR=""
SCALE="1"
QUALITY="85"

show_help() {
    cat << EOF
Uso: $0 [opções]

Opções:
  -i, --input <caminho>     Diretório com arquivos PNG ou caminho de um único arquivo (Padrão: diretório atual)
  -o, --output <caminho>    Diretório de saída para os arquivos WEBP (Padrão: mesmo diretório de entrada)
  -s, --scale <2|4|1|0.5>   Fator de escala da imagem (Ex: 2 para 2x, 4 para 4x, 1 para original)
  -q, --quality <1-100>     Qualidade da imagem WebP (Padrão: 85)
  -h, --help                Exibe esta mensagem de ajuda

Exemplos:
  $0 -s 2                      # Converte PNGs do diretório atual em 2x
  $0 -i ./sprites -s 4 -q 90   # Converte PNGs da pasta sprites em 4x com qualidade 90
  $0                           # Modo interativo (pergunta as opções)
EOF
    exit 0
}

INTERACTIVE=true
while [[ $# -gt 0 ]]; do
    INTERACTIVE=false
    case "$1" in
        -i|--input)
            INPUT_DIR="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -s|--scale)
            SCALE="$2"
            shift 2
            ;;
        -q|--quality)
            QUALITY="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            ;;
        *)
            if [[ -d "$1" || -f "$1" ]]; then
                INPUT_DIR="$1"
                shift
            else
                echo -e "${RED}[ERRO] Opção desconhecida: $1${NC}"
                show_help
            fi
            ;;
    esac
done

if [ "$INTERACTIVE" = true ]; then
    read -rp "Informe a pasta ou arquivo PNG de entrada [padrão: .]: " user_input
    if [ -n "$user_input" ]; then
        INPUT_DIR="$user_input"
    fi

    echo -e "\n${YELLOW}Escolha a escala de redimensionamento:${NC}"
    echo "  1) 1x   - Tamanho original (sem redimensionar)"
    echo "  2) 2x   - Dobro do tamanho original"
    echo "  3) 4x   - Quatro vezes o tamanho original"
    echo "  4) 0.5x - Metade do tamanho original"
    echo "  5) 0.25x- Um quarto do tamanho original"
    read -rp "Opção [1-5, padrão: 1]: " scale_choice

    case "$scale_choice" in
        2) SCALE="2" ;;
        3) SCALE="4" ;;
        4) SCALE="0.5" ;;
        5) SCALE="0.25" ;;
        *) SCALE="1" ;;
    esac

    read -rp "Informe a qualidade WebP (1-100) [padrão: 85]: " user_quality
    if [ -n "$user_quality" ]; then
        QUALITY="$user_quality"
    fi
fi

if [ ! -e "$INPUT_DIR" ]; then
    echo -e "${RED}[ERRO] Caminho de entrada não existe: $INPUT_DIR${NC}"
    exit 1
fi

if [ -z "$OUTPUT_DIR" ]; then
    if [ -d "$INPUT_DIR" ]; then
        OUTPUT_DIR="$INPUT_DIR"
    else
        OUTPUT_DIR="$(dirname "$INPUT_DIR")"
    fi
fi

mkdir -p "$OUTPUT_DIR"

FILES=()
if [ -f "$INPUT_DIR" ]; then
    if [[ "$INPUT_DIR" =~ \.png$|\.PNG$ ]]; then
        FILES+=("$INPUT_DIR")
    else
        echo -e "${RED}[ERRO] O arquivo informado não é um PNG: $INPUT_DIR${NC}"
        exit 1
    fi
else
    while IFS= read -r -d '' file; do
        FILES+=("$file")
    done < <(find "$INPUT_DIR" -maxdepth 1 -type f \( -name "*.png" -o -name "*.PNG" \) -print0)
fi

TOTAL=${#FILES[@]}
if [ "$TOTAL" -eq 0 ]; then
    echo -e "${YELLOW}[AVISO] Nenhum arquivo PNG encontrado em: $INPUT_DIR${NC}"
    exit 0
fi

echo -e "\n${CYAN}Configurações de Conversão:${NC}"
echo -e "  • Total de arquivos : ${GREEN}$TOTAL${NC}"
echo -e "  • Escala            : ${GREEN}${SCALE}x${NC}"
echo -e "  • Qualidade         : ${GREEN}${QUALITY}%${NC}"
echo -e "  • Pasta de saída    : ${GREEN}$OUTPUT_DIR${NC}\n"

convert_file() {
    local in_file="$1"
    local base_name
    base_name=$(basename "$in_file")
    base_name="${base_name%.*}"
    local out_file="$OUTPUT_DIR/${base_name}.webp"

    case "$CONVERTER" in
        ffmpeg)
            local scale_filter=""
            if [ "$SCALE" != "1" ]; then
                scale_filter="-vf scale=iw*${SCALE}:ih*${SCALE}:flags=lanczos"
            fi
            ffmpeg -y -v error -i "$in_file" $scale_filter -c:v libwebp -quality "$QUALITY" "$out_file"
            ;;
        cwebp)
            local resize_opt=""
            if [ "$SCALE" != "1" ]; then
                echo "[cwebp] Redimensionando via cwebp..."
            fi
            cwebp -q "$QUALITY" "$in_file" -o "$out_file" >/dev/null 2>&1
            ;;
        python)
            python3 - <<PY
from PIL import Image
img = Image.open("$in_file")
scale = float("$SCALE")
if scale != 1.0:
    new_w = int(img.width * scale)
    new_h = int(img.height * scale)
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
img.save("$out_file", "WEBP", quality=int("$QUALITY"))
PY
            ;;
    esac
}

SUCCESS=0
FAILED=0
CURRENT=0

for file in "${FILES[@]}"; do
    CURRENT=$((CURRENT + 1))
    filename=$(basename "$file")
    printf " [%3d/%3d] Convertendo: %-40s " "$CURRENT" "$TOTAL" "$filename"

    if convert_file "$file"; then
        echo -e "${GREEN}✓ Concluído${NC}"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${RED}✗ Falhou${NC}"
        FAILED=$((FAILED + 1))
    fi
done

echo -e "\n${CYAN}====================================================${NC}"
echo -e "${GREEN}Conversão finalizada com sucesso: $SUCCESS${NC}"
if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}Falhas: $FAILED${NC}"
fi
echo -e "${CYAN}Arquivos salvos em: $OUTPUT_DIR${NC}"
echo -e "${CYAN}====================================================${NC}"
