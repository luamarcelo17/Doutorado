import random
from flask import url_for
import datetime, os, glob, re
__imagem_avatar = {
    'cachorro':'dog_emoji.png',
    'gato':'cat_emoji.png',
    'panda':'panda_emoji.png',
    'leao':'lion_emoji.png',
    'macaco':'monkey_emoji.png',
    'tigre':'tiger_emoji.png',
    'hipopotamo':'hipoppotamus_emoji.png',
    'guaxinim':'raccoon_emoji.png',
    'coala':'koala_emoji.png',
    'gorila':'gorilla_emoji.png',
    'coelho':'rabbit_emoji.png',
    'raposa':'fox_emoji.png',
    'vaca':'cow_emoji.png',
    'urso':'bear_emoji.png',
    'porco':'pig_emoji.png',
    'lobo':'wolf_emoji.png'
}

__objetos = {
  "01":"sol",
  "02":"castelo_qr",
  "03":"tinta",
  "04":"passaro",
  "05":"barco",
  "06":"aviao",
  "81":"medo",
  "82":"feliz",
  "83":"raiva",
  "84":"triste",
  "85":"entediado",
  "86":"calmo"
}

def get_url_avatar(avatar_nome):
     return url_for('static', filename=f'images/avatar/{__imagem_avatar[avatar_nome]}')

def get_avatar(url):
    if url == '':
        return ''
    url = url.split("/")[4]
    for avatar in __imagem_avatar:
        if __imagem_avatar[avatar] == url:
            return avatar

def get_nome_qrcode(numero_qrcode):
    print("Início dos testes")
    diretorio_corrente = os.path.dirname(os.path.realpath(__file__))
    diretorio_qrcode = os.path.join(diretorio_corrente,'..','static','images','qrcode')
    nome_arquivo_pesquisado = "{}*-emoji.png".format(numero_qrcode)
    print(diretorio_qrcode)
    print(nome_arquivo_pesquisado)
    lista_arquivos = glob.glob(os.path.join(diretorio_qrcode,nome_arquivo_pesquisado))
    if lista_arquivos:
       nome_arquivo_qrcode =  lista_arquivos[0]
       print(nome_arquivo_qrcode)
       expressao_encontrada = re.search(r'\d+\-([^\-]+)\-emoji.png$',nome_arquivo_qrcode)
       print(expressao_encontrada)
       #title_search = re.search('<title>(.*)</title>', html, re.IGNORECASE)
       if expressao_encontrada:
           return expressao_encontrada.group(1)
    return 'Nome do QRCode Número {} não encontrado'.format(numero_qrcode)

def get_data_fim_cookie():
    data_expiracao = datetime.datetime.now()
    data_expiracao = data_expiracao + datetime.timedelta(hours=6) #OBS: Qnd colocou 3 horas ele não criou o cookie
    return data_expiracao

def get_objeto_qrcode(num):
    return __objetos[num]

def resolve_id():
	L = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
	l = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','o','q','r','s','t','u','v','w','x','y','z']
	return (str(random.randint(0,9))+str(random.randint(0,9))+l[random.randint(0,25)]+l[random.randint(0,25)]+L[random.randint(0,25)]+L[random.randint(0,25)])