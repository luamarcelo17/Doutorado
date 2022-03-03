import os
import shutil

def excluir_arquivo_foto(arquivo_foto):
    diretorio_corrente = os.path.dirname(os.path.realpath(__file__))  
    diretorio_fotos_excluidas = os.path.join(diretorio_corrente,'..','deleted_photos')
    caminho_arquivo_foto = os.path.join(diretorio_corrente,'..','static','photos', arquivo_foto)
    if(not os.path.isdir(diretorio_fotos_excluidas)):
            os.mkdir(diretorio_fotos_excluidas)
    shutil.move(caminho_arquivo_foto,diretorio_fotos_excluidas)