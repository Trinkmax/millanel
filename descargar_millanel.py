#!/usr/bin/env python3
# Descarga de imagenes de productos Millanel - Pagina 1 (51 productos / 66 imagenes)
import os, urllib.request

CARPETA = "millanel_fotos"
os.makedirs(CARPETA, exist_ok=True)

#!/usr/bin/env python3
# Descarga de fotos de productos Millanel - Pagina 1 (51 productos / 66 imagenes)
# Uso: python3 descargar_millanel.py
import os, urllib.request

CARPETA = "millanel_fotos"
os.makedirs(CARPETA, exist_ok=True)

IMAGENES = [
    ("https://tienda.millanel.com/nximages/1752750417390.jpg", "01030062_Fragancia-Alternativa-N-62-30-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752750448536.jpg", "01030173_Fragancia-Alternativa-N-173-30-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752750408874.jpg", "01030186_Fragancia-Alternativa-N-186-30-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1733138440521.jpg", "01030301_Fragancia-Alternativa-N-301-30-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752750355083.jpg", "01060036_Fragancia-Alternativa-N-36-60-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752750377033.jpg", "01060062_Fragancia-Alternativa-N-62-60-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752750391704.jpg", "01060168_Fragancia-Alternativa-N-168-60-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752824559873.jpg", "01060186_Fragancia-Alternativa-N-186-60-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611589856159.jpg", "01060201_Fragancia-Alternativa-N-201-60-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1620045305531.jpg", "01060256_Fragancia-Alternativa-N-256-60-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1641474778203.jpg", "01060265_Fragancia-Alternativa-N-265-60-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752824606532.jpg", "01100062_Fragancia-Alternativa-N-62-100-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752828034384.jpg", "01100168_Fragancia-Alternativa-N-168-100-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752827951204.jpg", "01100182_Fragancia-Alternativa-N-182-100-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752827912920.jpg", "01100186_Fragancia-Alternativa-N-186-100-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611589869997.jpg", "01100201_Fragancia-Alternativa-N-201-100-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1622222927804.jpg", "01536005_Eau-de-Parfum-Heroe-105-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1622222934433.jpg", "01536005_Eau-de-Parfum-Heroe-105-ml_2.jpg"),
    ("https://tienda.millanel.com/nximages/1760443031665.jpg", "01536039_Eau-de-Parfum-Mirage-Bourbon-100-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1760443120964.jpg", "01536039_Eau-de-Parfum-Mirage-Bourbon-100-ml_2.jpg"),
    ("https://tienda.millanel.com/nximages/1779973183741_4.jpg", "01600062_Fragancia-Alternativa-Roll-On-N-62-10-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1779973183966_5.jpg", "01600062_Fragancia-Alternativa-Roll-On-N-62-10-ml_2.jpg"),
    ("https://tienda.millanel.com/nximages/1752827838412.jpg", "01600186_Fragancia-Alternativa-Roll-On-N-186-10-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752827893329.jpg", "01600186_Fragancia-Alternativa-Roll-On-N-186-10-ml_2.jpg"),
    ("https://tienda.millanel.com/nximages/1752827841176.jpg", "01600201_Fragancia-Alternativa-Roll-On-N-201-10-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1752827926619.jpg", "01600201_Fragancia-Alternativa-Roll-On-N-201-10-ml_2.jpg"),
    ("https://tienda.millanel.com/nximages/1611590380459.jpg", "05057516_Repuesto-de-jabon-liquido-Frutos-Rojos-200-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611590373749.jpg", "05092014_Set-de-Jabones-Manitos-Zoo-Magic_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611590377660.jpg", "05092014_Set-de-Jabones-Manitos-Zoo-Magic_2.jpg"),
    ("https://tienda.millanel.com/nximages/1611590372808.jpg", "05100001_Colonia-Manitos-Amarillas-100-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611590377152.jpg", "05100001_Colonia-Manitos-Amarillas-100-ml_2.jpg"),
    ("https://tienda.millanel.com/nximages/1611590381417.jpg", "05100015_Colonia-Manitos-Amarillas-250-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1717261646653.jpg", "05302510_Desodorante-antitranspirante-en-crema-Milanel-for-Men-50-g_1.jpg"),
    ("https://tienda.millanel.com/nximages/1617292513665.jpg", "05800013_Spray-Repelente-Basta-Mosquito-Extra-Duracion-500-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1717261645282.jpg", "05800014_Spray-Repelente-Basta-Mosquito-Extra-Duracion-195-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1643372318834.jpg", "16010007_Emulsion-corporal-con-Palta-y-Avena-280-g_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611590709739.jpg", "16053020_Agua-Micelar-Millanel-Care-100-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611590717138.jpg", "16103300_Crema-para-rostro-Antiedad-de-dia-Millanel-Care-50-g_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611590714560.jpg", "16103300_Crema-para-rostro-Antiedad-de-dia-Millanel-Care-50-g_2.jpg"),
    ("https://tienda.millanel.com/nximages/1611590711228.jpg", "16103301_Crema-para-rostro-Antiedad-de-noche-Millanel-Care-50-g_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611590714467.jpg", "16103301_Crema-para-rostro-Antiedad-de-noche-Millanel-Care-50-g_2.jpg"),
    ("https://tienda.millanel.com/nximages/1611590714988.jpg", "16103303_Crema-para-rostro-Humectante-Millanel-Care-50-g_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611590713081.jpg", "16103303_Crema-para-rostro-Humectante-Millanel-Care-50-g_2.jpg"),
    ("https://tienda.millanel.com/nximages/1611590719828.jpg", "17080003_Shampoo-para-ninos-Manitos-200-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611590718536.jpg", "17101002_Oleo-Extraordinario-6-Beneficios-Expert-95-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591062836.jpg", "20050502_Sahumerios-Surtidos_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591068742.jpg", "20500522_Aromatizante-Mistura-de-Frutas-500-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591065804.jpg", "20500523_Aromatizante-Mimitos-500-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591062720.jpg", "20500524_Aromatizante-Capullo-de-Suavidad-500-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591060223.jpg", "20500525_Aromatizante-Lavanderia-500-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591066168.jpg", "20500526_Aromatizante-Toques-de-Lino-500-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1677586910190.jpg", "20500546_Repuesto-Aromatizante-Toques-de-Lino-500-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1677586910270.jpg", "20500547_Repuesto-Aromatizante-Lavanderia-500-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1701865166447.jpg", "20500554_Repuesto-Aromatizante-Capullo-de-Suavidad-500-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591486581.jpg", "47173001_Delineador-Liquido-Millanel-Negro-3-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591486157.jpg", "47173001_Delineador-Liquido-Millanel-Negro-3-ml_2.jpg"),
    ("https://tienda.millanel.com/nximages/1611591487413.jpg", "47174001_Delineador-en-Gel-negro-2-g_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591485432.jpg", "47174001_Delineador-en-Gel-negro-2-g_2.jpg"),
    ("https://tienda.millanel.com/nximages/1611591480073.jpg", "47355002_Delineador-retractil-Millanel-0-3-g_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591487173.jpg", "47405002_Mascara-negra-a-prueba-de-agua-Millanel-12-g_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591488092.jpg", "47405002_Mascara-negra-a-prueba-de-agua-Millanel-12-g_2.jpg"),
    ("https://tienda.millanel.com/nximages/1742901795042.jpg", "47474100_Mascara-para-pestanas-Lovely-Lashes-13-g_1.jpg"),
    ("https://tienda.millanel.com/nximages/1742901908825.jpg", "47474100_Mascara-para-pestanas-Lovely-Lashes-13-g_2.jpg"),
    ("https://tienda.millanel.com/nximages/1646221771230.jpg", "47801133_Esmalte-Millanel-Mate-Smokey-Nude-11-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591890953.jpg", "47811104_Calcio-para-unas-Millanel-Beige-11-ml_1.jpg"),
    ("https://tienda.millanel.com/nximages/1611591887642.jpg", "47811104_Calcio-para-unas-Millanel-Beige-11-ml_2.jpg"),
]

hdr = {"User-Agent": "Mozilla/5.0"}
for i, (url, nombre) in enumerate(IMAGENES, 1):
    destino = os.path.join(CARPETA, nombre)
    if os.path.exists(destino):
        print(f"[{i}/{len(IMAGENES)}] ya existe: {nombre}")
        continue
    try:
        req = urllib.request.Request(url, headers=hdr)
        with urllib.request.urlopen(req, timeout=30) as resp, open(destino, "wb") as f:
            f.write(resp.read())
        print(f"[{i}/{len(IMAGENES)}] OK: {nombre}")
    except Exception as e:
        print(f"[{i}/{len(IMAGENES)}] ERROR {nombre}: {e}")

print("Listo. Carpeta:", os.path.abspath(CARPETA))