import os, datetime
from uteis.funcoes import get_avatar
import csv

class Log:

    def __init__(self):
        self.diretorio_corrente = os.path.dirname(os.path.realpath(__file__))

    def __criar_arquivo_logCSV(self):
        data = datetime.datetime.now()
        nome_arquivo_log = 'log_{:%Y-%m-%d}.csv'.format(data)
        diretorio_log = os.path.join(self.diretorio_corrente,'static','oficina','log')
        if(not os.path.isdir(diretorio_log)):
            os.mkdir(diretorio_log)
        arquivo_log = os.path.join(self.diretorio_corrente,'static','oficina','log',nome_arquivo_log)
        return arquivo_log


    def registrar_logCSV(self, participante, sala, interface, descricao, objeto):
        data = datetime.datetime.now()
        arquivo_log = self.__criar_arquivo_logCSV()
        with open(arquivo_log, 'w', encoding="utf-8", errors="ignore", newline='') as csvfile:
            fieldnames = ['DATA','HORA','NOME_OFICINA','NOME_PARTICIPANTE','ID_PARTICIPANTE','INTERFACE','DESCRIÇÃO','OBJETO']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerow({
                'DATA':"{:%Y-%m-%d}".format(data),
                'HORA': "{:%H:%M:%S}".format(data),
                'NOME_OFICINA':sala,
                'NOME_PARTICIPANTE':participante['nome'],
                'ID_PARTICIPANTE':participante['id'],
                'INTERFACE':interface,
                'DESCRIÇÃO':descricao,
                'OBJETO':objeto
                })

    def __criar_arquivo_log(self,sala):
        data = datetime.datetime.now()
        nome_arquivo_log = 'log_'+sala+'_{:%Y-%m-%d}.log'.format(data)
        diretorio_log = os.path.join(self.diretorio_corrente,'static','oficina')
        if(not os.path.isdir(diretorio_log)):
            os.mkdir(diretorio_log)
        diretorio_log = os.path.join(self.diretorio_corrente,'static','oficina','log')
        if(not os.path.isdir(diretorio_log)):
            os.mkdir(diretorio_log)
        arquivo_log = os.path.join(self.diretorio_corrente,'static','oficina','log',nome_arquivo_log)
        if(not os.path.isfile(arquivo_log)):
            with open(arquivo_log, 'a', encoding="utf8") as logfile:
                logfile.write("Data;Hora;Oficina;ID Participante;Nome Participante;Avatar;Interface;Descrição;Objeto")
        return arquivo_log

    def registrar_log(self, participante, sala,interface, descricao, objeto):
        #self.registrar_logCSV(participante, sala,interface, descricao)
        data = datetime.datetime.now()
        arquivo_log = self.__criar_arquivo_log(sala)
        with open(arquivo_log, 'a', encoding="utf8") as logfile:
                logfile.write("\n")
                logfile.write("{:%Y-%m-%d};".format(data))
                logfile.write("{:%H:%M:%S};".format(data))
                logfile.write(sala)
                logfile.write(";")
                logfile.write(participante['id'])
                logfile.write(";")
                logfile.write(participante['nome'])
                logfile.write(";")
                logfile.write(get_avatar(participante['url_avatar']))
                logfile.write(";Interface: ")
                logfile.write(interface)
                logfile.write(";")
                logfile.write(descricao)
                logfile.write(";")
                logfile.write(objeto)