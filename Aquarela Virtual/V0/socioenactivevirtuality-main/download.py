import os, datetime
import zipfile

__diretorio_corrente = os.path.dirname(os.path.realpath(__file__))


def zipdir(ziph):
    path = os.path.join(__diretorio_corrente,'static','oficina')
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file), 
                       os.path.relpath(os.path.join(root, file), 
                                       os.path.join(path, '..')))

def get_file():
    data = datetime.datetime.now()
    caminho = os.path.join(__diretorio_corrente,'static','arquivo_zip')
    if(not os.path.isdir(caminho)):
            os.mkdir(caminho)
    for file_name in os.listdir(caminho):
        if file_name.endswith('.zip'):
              os.remove(caminho+'/'+file_name)
    nome_arquivo = 'arquivos_{:_%Y_%m_%d_%H_%M_%S}.zip'.format(data)
    print(nome_arquivo)
    zipf = zipfile.ZipFile(caminho+'/'+nome_arquivo, 'w', zipfile.ZIP_DEFLATED)
    zipdir(zipf)
    zipf.close()
    return 'arquivo_zip/' + nome_arquivo


