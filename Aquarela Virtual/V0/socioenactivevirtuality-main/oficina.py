from download import get_file
from log import Log
from foto_captura import Foto

class Oficina:
    __solicitacao_terminar = False
    __nome = None
    __participantes_online = {}
    __controle_animacao = {}
    __estrofe = 0
    __emocoes_basicas = {'81','82','83','84','85','86'} 
    __objetos_disponiveis = ['01','02','03','04','05','06']
    __objetos_enviados = []
    __sids_logados = {}
    __mapa_estrofes = {'01':1,'02':1,'03':2,'04':2,'05':3,'06':4}
    __rank = {1:[],2:[],3:[],4:[]}
    __instance = None
    __log = Log()
    __foto = None
    __proxima = []
    @staticmethod
    def getInstance():
      if Oficina.__instance == None:
         Oficina()
      return Oficina.__instance
      
    def __init__(self):
         if Oficina.__instance != None:
             raise Exception("Use Oficina.getIntance()")
         else:
            Oficina.__instance = self
            self.__foto = Foto.getInstance()

    def set_nome_oficina(self,nome):
        self.__nome = nome
        self.__foto.set_nome_oficina(nome)

    def set_fim_oficina(self,flag):
        self.__solicitacao_terminar = flag

    def terminou_oficina(self):
        return self.__solicitacao_terminar

    def get_sala(self):
        return self.__nome

    def verifica_emocao(self,code):
        if code in self.__emocoes_basicas:
            return True
        return False
    
    def get_participantes_online(self,id):
        lista = []
        for key in self.__participantes_online:
            if self.__busca_id(id):
                lista.append(self.__participantes_online[key])
        return lista
    
    def get_todos_avatares(self):
        lista = []
        for key in self.__participantes_online:
            if self.__busca_id(id):
                lista.append({"nome":self.__participantes_online[key]['nome'],'url_avatar':self.__participantes_online[key]['url_avatar']})
        return lista

    def addicionar_participante(self,participante,sid):
        id = participante['id']
        if self.__busca_id(id):
            self.__participantes_online[sid] = participante
            self.__sids_logados[id] = sid
   
    def get_participante_oficina(self,id):
        for key in self.__participantes_online:
            if self.__busca_id(id):
               return self.__participantes_online[key]
        return None

    def __busca_id(self,id):
        for sid in self.__participantes_online:
            if self.__participantes_online[sid]['id'] == id:
                return False
        return True
    
    def remover_participante(self,id, sid):
        if sid in self.__controle_animacao:
            self.__controle_animacao.pop(sid)
            if len(self.__controle_animacao) == 0:
                self.finalizar_estrofe()
        if sid in self.__participantes_online:
            self.__participantes_online.pop(sid)
        if id in self.__sids_logados:
            self.__sids_logados.pop(id)        

    def inicia_estrofe(self,qrcode):
        if self.__estrofe == 0 and qrcode in self.__objetos_disponiveis:
            self.__estrofe = self.__inicia_estrofe(qrcode)  
            return self.get_estrofe() != 0
        else:
            return False

    def __inicia_estrofe(self,qrcode):
        return self.__mapa_estrofes[qrcode]      

    def get_estrofe(self):
        return self.__estrofe

    def get_sid_participante(self,id):
        return self.__sids_logados[id]
    
    def enviar_objeto(self,obj):
        if not self.verificar_envio(obj):
            self.__objetos_enviados.append(obj)
            return True
        return False

    def verifica_estrofe_iniciada(self,qrcode,obj):
        if self.get_estrofe() == 3 and qrcode == '05':
            return not self.verificar_envio(obj)
        elif self.get_estrofe() == 4 and qrcode == '06':
            return not self.verificar_envio(obj)
        else:
            if  self.get_estrofe() == 1 and (qrcode == '01' or qrcode == '02'):
                return not self.verificar_envio(obj)
            elif  self.get_estrofe() == 2 and (qrcode == '03' or qrcode == '04'):
                return not self.verificar_envio(obj)
            else:
                return False

    def enviou_avatar(self,id):
        for obj in self.__objetos_enviados:
          if obj['id'] == id:
              return True
        return False

    def verificar_envio(self,obj):
        return (obj in self.__objetos_enviados)

    def controle_estrole(self,controle,sid):
        if(controle['st'] == 1):
            if len(self.__controle_animacao) > 0:
                if sid in self.__controle_animacao:
                   self.__controle_animacao.pop(sid)
                if len(self.__controle_animacao) == 0:
                   self.finalizar_estrofe()
        elif(controle['st'] == 0):
            self.__controle_animacao[sid] = controle['id']
        return self.__solicitacao_terminar
        
    def finalizar_estrofe(self):
        self.__estrofe = 0
        self.__controle_animacao = {}
        self.__objetos_enviados = []

    def estado_atual(self):
        if self.get_estrofe() != 0:
            print('Estrole ' + str(self.get_estrofe()) + ' em andamento')
            print(str(self.__objetos_enviados))
            return self.__objetos_enviados

    def gravar_log(self,participante,interface,acao,objeto):
        if participante['id'] == None:
            participante = {'id':'', 'nome': '', 'url_avatar': ''}
        self.__log.registrar_log(participante, self.__nome, interface, acao, objeto)
        
    def get_fotos_encerramento(self):
        return self.__foto.get_fotos()

    def selecionar_proxima(self):
        index = 1
        self.__proxima = self.__rank[index]
        for i in range(2,len(self.__rank)+1):
            if len(self.__rank[i]) >= len(self.__proxima):
                self.__proxima = self.__rank[i]
                index = i
        self.__rank[index] = []
        return self.__proxima

    def get_estrofe_voto(self,obj):
        return self.__mapa_estrofes[obj]

    def votar(self,dado):
        if self.get_estrofe() != self.__mapa_estrofes[dado['objeto']]:
                self.__rank[self.__mapa_estrofes[dado['objeto']]].append(dado)
                
    def gerar_arquivo_zip(self):
        return get_file()