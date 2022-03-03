import os, datetime
import base64
import shutil

class Foto:
    __nome_oficina = None
    __fotos_remocao = []
    __diretorio_corrente = None
    __instance = None

    @staticmethod
    def getInstance():
      if Foto.__instance == None:
         Foto()
      return Foto.__instance

    def __init__(self):
         if Foto.__instance != None:
             raise Exception("Use Foto.getIntance()")
         else:
            Foto.__instance = self
            self.__diretorio_corrente = os.path.dirname(os.path.realpath(__file__))
    
    def set_nome_oficina(self,nome):
        self.__nome_oficina = nome
        print(self.__nome_oficina)

    def resolve_remocao(self,caminho):
        print(self.__fotos_remocao)
        if not caminho['checked']:
                for x in self.__fotos_remocao:
                     if x['id'] == caminho['id']:
                        self.__fotos_remocao.remove(x)
        elif caminho['checked']:
            self.__fotos_remocao.append(caminho)
            
    def get_lista_fotos_remocao(self):
        return self.__fotos_remocao

    def snapshot_file_name(self,nome_oficina,participante, id):
        data_hora = datetime.datetime.now()
        #nome_arquivo = '{}_{}_{}_{:%Y_%m_%d_%Hh_%Mm_%Ss}.jpg'.format(nome_oficina,id,participante,data_hora)
        nome_arquivo = '{}_{:%Y_%m_%d_%Hh_%Mm_%Ss}_{}_{}.jpg'.format(nome_oficina,data_hora,id,participante)
        return nome_arquivo

    #def snapshot_save(self, snapshot, nome_oficina, participante, id):
    #    caminho_arquivos = os.path.join(self.__diretorio_corrente,'static','photos')
    #    nome_arquivo_foto = self.snapshot_file_name(nome_oficina, participante, id)
    #    if(not os.path.isdir(caminho_arquivos)):
    #        os.mkdir(caminho_arquivos)
    #    caminho_arquivo_foto = os.path.join(caminho_arquivos, nome_arquivo_foto)
    #    print (caminho_arquivo_foto)
    #    snapshot.save(caminho_arquivo_foto)
    #    pass
    def __formatar_foto_admin(self, nome_foto):
        print(nome_foto)
        return {'caminho':f'/oficina/{self.__nome_oficina}/{nome_foto}','descricao': self.__formata_nome_arquivo_foto(nome_foto)}

    def snapshot_save(self, snapshot, nome_oficina, participante, id):
        diretorio_photos = os.path.join(self.__diretorio_corrente,'static','oficina',self.__nome_oficina)
        nome_arquivo_foto = self.snapshot_file_name(nome_oficina, participante, id)
        if(not os.path.isdir(diretorio_photos)):
            os.mkdir(diretorio_photos)
        caminho_arquivo_foto = os.path.join(diretorio_photos, nome_arquivo_foto)
        base64_img_bytes = snapshot.encode('utf-8')
        with open(caminho_arquivo_foto, 'wb') as file_to_save:
            decoded_image_data = base64.decodebytes(base64_img_bytes)
            file_to_save.write(decoded_image_data)
        return {'caminho':f'{self.__nome_oficina}/{nome_arquivo_foto}','descricao': self.__formata_nome_arquivo_foto(nome_arquivo_foto)}


    def snapshot_save64(self, snapshot,nome_oficina, participante, id):
        diretorio_photos = os.path.join(self.__diretorio_corrente,'static','oficina',self.__nome_oficina+'-qrc')
        nome_arquivo_foto = self.snapshot_file_name(nome_oficina, participante, id)
        if(not os.path.isdir(diretorio_photos)):
            os.mkdir(diretorio_photos)
        caminho_arquivo_foto = os.path.join(diretorio_photos, nome_arquivo_foto)
        base64_img_bytes = snapshot.encode('utf-8')
        with open(caminho_arquivo_foto, 'wb') as file_to_save:
            decoded_image_data = base64.decodebytes(base64_img_bytes)
            file_to_save.write(decoded_image_data)
        return nome_arquivo_foto

    def mover_fotos(self):
        novo_diretorio_photos = os.path.join(self.__diretorio_corrente,'static','oficina','removidas')
        if(not os.path.isdir(novo_diretorio_photos)):
            os.mkdir(novo_diretorio_photos)
        novo_sub_diretorio_photos = os.path.join(self.__diretorio_corrente,'static','oficina','removidas', self.__nome_oficina)
        if(not os.path.isdir(novo_sub_diretorio_photos)):
            os.mkdir(novo_sub_diretorio_photos)
        for image in self.__fotos_remocao:
            photos = os.path.join(self.__diretorio_corrente,'static','oficina',image['id'])
            removidas = os.path.join(novo_diretorio_photos,image['id'])
            shutil.move(photos, removidas)
        self.__fotos_remocao = []
        return self.__fotos_remocao

    def get_fotos(self):
        lista = []
        caminho_arquivos = os.path.join(self.__diretorio_corrente,'static','oficina',self.__nome_oficina)
        if(not os.path.isdir(caminho_arquivos)):
            os.mkdir(caminho_arquivos)
        lista = [f'/static/oficina/{self.__nome_oficina}/{nome_foto}' for nome_foto in os.listdir(caminho_arquivos)]
        return lista

    def __formata_nome_arquivo_foto(self,nome_arquivo):
        print(nome_arquivo)
        string_formatada = f'Oficina: {nome_arquivo.replace("_"," ")}'
        return string_formatada

    def listar_arquivos_fotos(self):
        diretorio_corrente = os.path.dirname(os.path.realpath(__file__))
        print(self.__nome_oficina)
        caminho_arquivos = os.path.join(diretorio_corrente,'static','oficina',self.__nome_oficina)
        if(not os.path.isdir(caminho_arquivos)):
            os.mkdir(caminho_arquivos)
        lista_nomes_arquivos = []
        for nome_foto in os.listdir(caminho_arquivos):
            lista_nomes_arquivos.append(self.__formatar_foto_admin(nome_foto))
        print(lista_nomes_arquivos)
        return lista_nomes_arquivos
    
