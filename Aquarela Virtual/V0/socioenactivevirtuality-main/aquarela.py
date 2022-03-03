
from flask import Flask
from flask import Blueprint, url_for, render_template, Response, redirect, session, flash, send_file, request, make_response
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms, send
from deteccao_cor import DeteccaoCor
from foto_captura import Foto
from admin.views import bp_admin
from uteis.funcoes import get_avatar, get_objeto_qrcode, get_url_avatar, get_data_fim_cookie, resolve_id, get_nome_qrcode
import os
os.environ.setdefault('FORKED_BY_MULTIPROCESSING', '1')
import eventlet
eventlet.monkey_patch()
import threading
from oficina import Oficina

#Cria a aplicação
app = Flask(__name__)
app.secret_key = '65kXuwka'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
socket_io = SocketIO(app)

detector_cor = DeteccaoCor()
oficina = Oficina.getInstance()
liberar = False
oficina.set_nome_oficina('Aquarela_SEM_NOME')
oficina.set_fim_oficina(False)
foto = Foto.getInstance()
lista_admin = {}
#Registrar Blueprints (Módulos)
app.register_blueprint(bp_admin, url_prefix='/admin')
#Rotas da aplicação (Raiz)
@app.route('/')
@app.route('/index')
def index():
	global detector_cor
	detector_cor.count = 0
	if ('id_participante' in request.cookies):
		registrar_log('login','Retornou a primeira página para alterar nome ou avatar','')
		participante = get_participante()
		return render_template('login_participante.html', titulo_pagina="Aquarela Virtual", contador=detector_cor.count, nome_participante=participante['nome'], avatar=get_avatar(participante['url_avatar']))
	else:
		return render_template('login_participante.html', titulo_pagina="Aquarela Virtual", contador=detector_cor.count, nome_participante='',avatar='')

@app.route('/desenho',methods= ['POST','GET'])
def quadro_desenho():
	if (request.method == 'POST'):
		if ('nome' in request.form and 'avatar' in request.form):
			global detector_cor, liberar
			detector_cor.count = 0
			nome_participante = request.form['nome']
			avatar =request.form['avatar']
			url_avatar = get_url_avatar(avatar)
			liberar = True
			if 'id_participante' in request.cookies:
				id_participante = request.cookies.get('id_participante')
			else:
				id_participante = resolve_id()
			#Para fazer login na mesma máquina descomente
			id_participante = id_participante = resolve_id()
			resposta = make_response(redirect (url_for('quadro_desenho')))
			data_expiracao_cookie = get_data_fim_cookie()
			resposta.set_cookie('id_participante', str(id_participante), expires= data_expiracao_cookie)
			resposta.set_cookie('nome',nome_participante, expires= data_expiracao_cookie)
			resposta.set_cookie('avatar', avatar, expires= data_expiracao_cookie)
			oficina.gravar_log({'id':id_participante, 'nome': nome_participante, 'url_avatar': url_avatar},'desenho',f'Fez login e iniciou os cookies com ({id_participante}) ({nome_participante}) e ({avatar})','')
			return resposta
	else:
		if ('id_participante' in request.cookies): #tratamento F5
			participante = get_participante()
			registrar_log('desenho','Reconectou - Atualização de página - F5','')
			liberar = True
			return render_template('folha_desenho.html', titulo_pagina="Aquarela Virtual", contador=detector_cor.count, nome_participante = participante['nome'], url_avatar=participante['url_avatar'])
		oficina.gravar_log({'id':None, 'nome': '', 'url_avatar': ''},'desenho','Tentativa de acesso direto a URL /desenho sem login','')
		liberar = False
		return redirect (url_for('index'))

#Quando a interface percebe que conectou ela chama a funçao
@socket_io.on('joined',namespace='/desenho')
def joined(data):
	global liberar
	if(data['eu_logado'] != None and liberar == False):
		liberar = True
	join_room(oficina.get_sala())
	emit('adicionar-participante',get_participante(),json=True,to='admin')
	emit('status', {'msg': get_participante()['nome'] +' entrou na sala.'}, to=oficina.get_sala())
	if (liberar):
		emit('eu-presente', get_participante(), to=request.sid)
		emit('inicia-presente', oficina.get_participantes_online(get_participante()['id']), to=request.sid)
		adiciona_participante(liberar, request.sid)
		registrar_log('socket.io','entrou na sala - Registrou participante no socket.io','')
		liberar = False

@socket_io.on('gerar-dados-oficina',namespace='/desenho')
def gerar_copia_dados(data):
	emit('link-dados-oficina',oficina.gerar_arquivo_zip(),to='admin')

@socket_io.on('joined-admin',namespace='/desenho')
def joined_admin(data):
	join_room('admin')
	lista_admin[request.sid] = {'admin':'admin'+request.sid}
	emit('inicia-presente-admin', oficina.get_participantes_online('0000'), to=request.sid)
	emit('status', 'Admim entrou na sala',to='admin')
	emit('btn-encerrar',{'encerrar':oficina.terminou_oficina()},to='admin')
	emit('lista_fotos_remocao', foto.get_lista_fotos_remocao(), to=request.sid)
	emit('nome_oficina',{'nome':oficina.get_sala()},to='admin')
	oficina.gravar_log({'id':'0000', 'nome': 'admin', 'url_avatar': ''},'tela admin', 'admin logou','')

@socket_io.on('terminar_oficina',namespace='/desenho')
def terminar_oficina(data):
	if oficina.terminou_oficina():
		oficina.set_fim_oficina(False)
		oficina.gravar_log({'id':'0000', 'nome': 'admin', 'url_avatar': ''},'Tela admin','Cancelou ou riniciou a oficina','')
	else:
		oficina.set_fim_oficina(True)
		if oficina.get_estrofe() == 0:
			finalizar_oficina()
			oficina.gravar_log({'id':'0000', 'nome': 'admin', 'url_avatar': ''},'Tela admin','Encerrando a oficina pois não existe estrofe em andamento','')
		else:
			oficina.gravar_log({'id':'0000', 'nome': 'admin', 'url_avatar': ''},'Tela admin','A oficina será encerrada após o fim da estrofe ' + str(oficina.get_estrofe()),'')
	emit('btn-encerrar',{'encerrar':oficina.terminou_oficina()},to='admin')
		

@socket_io.on('selecao_foto_server',namespace='/desenho')
def selecionar_fotos(data):
	foto.resolve_remocao(data)
	emit('selecao_foto_admin',data,json=True,to='admin')
	oficina.gravar_log({'id':'0000', 'nome': 'admin', 'url_avatar': ''},'Tela Admim','Escolhendo fotos para remoção','')

@socket_io.on('mover_fotos',namespace='/desenho')
def mover_fotos(data):
	if len(foto.get_lista_fotos_remocao()) > 0:
		x = threading.Thread(target=foto.mover_fotos, args=())
		x.start()
		emit('lista_fotos_remocao_fim',[],to='admin')
		oficina.gravar_log({'id':'0000', 'nome': 'admin', 'url_avatar': ''},'Tela Admin','Removendo fotos','')

def finalizar_oficina():
	emit('gran_finale',{'listaFotos':oficina.get_fotos_encerramento(), 'listaParticipantes':oficina.get_todos_avatares()}, json=True,to=oficina.get_sala())
	oficina.gravar_log({'id':'0000', 'nome': 'admin', 'url_avatar': ''},'Tela admim','Encerramento da oficina','')

@socket_io.on('renomear_oficina',namespace='/desenho')
def renomear_oficina(data):	
	foto.set_nome_oficina(oficina.get_sala())
	oficina.gravar_log({'id':'0000', 'nome': 'admin', 'url_avatar': ''},'Tela Admim','Renomeou a oficina. De ' + oficina.get_sala() + ' para ' + data['nome'],'')
	oficina.set_nome_oficina(data['nome'])

sid_arduino = ''
@socket_io.on('joined_arduino')
def joined_arduino(data):
	global sid_arduino
	sid_arduino = request.sid
	emit('remote_aquarela',{"tag":"teste_client",'qrcode':"teste"},to=sid_arduino)

#Usar para botão de sair da oficina
@socket_io.on('left',namespace='/desenho')
def left(message):
	leave_room(oficina.get_sala())
	emit('status', {'msg': get_participante()['nome'] +' saiu na sala.'}, to=oficina.get_sala())
	registrar_log('socket.io','saiu da sala (botão sair)','')
	remove_participante(request.sid)

#Chamado num f5 ou perder conexão
@socket_io.on('disconnect',namespace='/desenho')
def disconnect():
	is_participante = True
	for sid in lista_admin:
		if sid == request.sid:
			lista_admin.pop(sid)
			is_participante = False
			break
	if is_participante:
		leave_room(oficina.get_sala())
		emit('status', {'msg': get_participante()['nome'] +' saiu na sala.'}, to=oficina.get_sala())
		emit('remover-participante-admin',get_participante()['id'], to='admin')
		remove_participante(request.sid)
		registrar_log('socket.io','saiu da sala ou perdeu conexao','')

@app.route("/upload",methods= ['POST'])
def upload():
	global detector_cor
	snapshot = request.files['webcam']
	detector_cor.update_count(snapshot)
	socket_io.emit('valor-amarelo', detector_cor.count,to=oficina.get_sala())
	registrar_log('opencv','Identificou cor (count= {detector_cor.count})','')
	return str(detector_cor.count)

@socket_io.on('foto-leitura',namespace='/desenho')
def foto_qrcode(data):
	participante = get_participante()
	nome = foto.snapshot_save64(data['foto'], oficina.get_sala(), participante['nome'],participante['id'])
	registrar_log('folha desenho','Participante mostrou qr-code ' + data['qrc'],nome)
	
@socket_io.on('salvar_foto',namespace='/desenho')
def salvar_foto(data):
	participante = get_participante()
	dados = foto.snapshot_save(data['foto'], oficina.get_sala(), participante['nome'],participante['id'])
	emit('update_foto',dados,to='admin')
	emit('feedback-social', {'participante': participante,'feedback': '00'}, json=True,to=oficina.get_sala())
	registrar_log('folha desenho','Participante '+ participante['nome'] + ' tirou uma foto',dados['caminho'].split('/')[1])

#@app.route("/snapshot", methods=['POST'])
#def snapshot_capture():
#	global foto
#	snapshot = request.files['webcam']
#	print(snapshot)
#	participante = get_participante()
#	x = threading.Thread(target=foto.snapshot_save, args=(snapshot, oficina.get_sala(), participante['nome'], participante['id'],))
#	x.start()
#	#foto.snapshot_save(snapshot, oficina.get_sala(), participante['nome'], participante['id'])
#	registrar_log('botão na folha desenho','Tirou uma foto')
#	return 'Carregou com sucesso'

#@socket_io.on('feedback',namespace='/desenho')
#def feeback_server(data):
#	emit('feedback-'+ data['tipo'], { 'participante': get_participante(), 'feedback': data['feedback']}, json=True,to=oficina.get_sala())

def inicia_estrofe(data,participante):
	print(str(oficina.get_estrofe()))
	emit('estrofe-'+str(oficina.get_estrofe()),participante, json=True,to=oficina.get_sala())
	emit('objeto-'+data+'-estrofe-'+str(oficina.get_estrofe()),participante, json=True,to=oficina.get_sala())
	emit('adiciona-avatar-estrofe-'+str(oficina.get_estrofe()), participante, json=True,to=oficina.get_sala())
	oficina.enviar_objeto({'id':participante['id'],'objeto':data})
	registrar_log('Sistema', 'Inicia estrofe ' + str(oficina.get_estrofe()), get_objeto_qrcode(str(data)))

def continua_oficina(data,participante):
	emit('objeto-'+data+'-estrofe-'+str(oficina.get_estrofe()),participante, json=True,to=oficina.get_sala())
	if not oficina.enviou_avatar(participante['id']):
		emit('adiciona-avatar-estrofe-'+str(oficina.get_estrofe()), participante, json=True,to=oficina.get_sala())
		registrar_log('Sistema', 'Estrofe ' + str(oficina.get_estrofe()) + ' em andamento. Enviar avatar', get_objeto_qrcode(str(data)))
	oficina.enviar_objeto({'id':participante['id'],'objeto':data})

def action_oficina(data,participante):
	if oficina.inicia_estrofe(data):
		inicia_estrofe(data,participante)
	else:
		if oficina.verificar_envio({'id':participante['id'],'objeto':data}):
			print('Animação em curso e avatar já adicionado para o participante. Pensar em trabalhar na animação...')
			registrar_log('Sistema','Votação para a estrofe ' + str(oficina.get_estrofe_voto(data)), get_objeto_qrcode(str(data)))
			oficina.votar({'participante':participante,'objeto':data})

		else:
			if oficina.verifica_estrofe_iniciada(data,{'id':participante['id']}):
				continua_oficina(data,participante)
			else:
				oficina.votar({'participante':participante,'objeto':data})
				registrar_log('Sistema', 'Votação para a estrofe ' + str(oficina.get_estrofe_voto(data)), get_objeto_qrcode(str(data)))

@socket_io.on('qrcode',namespace='/desenho')
def qrcode(data):
	if len(data) > 1:
		registrar_log('camera', 'Sistema escaneou o QR Code de Código ' + str(data), get_objeto_qrcode(str(data)))
		if not oficina.terminou_oficina():
			#socket_io.emit('remote_aquarela',{"tag":"teste_client","qrcode":data},to=sid_arduino)
			if ('id_participante' in request.cookies):
				participante = get_participante()
				if oficina.verifica_emocao(data):
					emit('feedback-afetivo-social', {'participante': participante, 'estadoAfetivo': str(data)}, json=True, to=oficina.get_sala())
					registrar_log('Sistema', 'Sistema mostrou emoção ' + str(data), get_objeto_qrcode(str(data)))
					return
				emit('feedback-social', {'participante': participante, 'feedback': str(data)}, json=True,to=oficina.get_sala())
				action_oficina(data,participante)
			else:
				print("Ignorando leitura " + data)
				registrar_log('Sistema', 'Erro! Não existe participante logado ' + str(data), get_objeto_qrcode(str(data)))
		else:
			registrar_log('Sistema', 'Oficina encerrada! Sistema não mostra nada para o qr-code ' + str(data), get_objeto_qrcode(str(data)))
			print("Oficina Encerrada... " + data)

@socket_io.on('animacao-status',namespace='/desenho')
def status_animacao(data):
	if oficina.controle_estrole(data,request.sid):
		if oficina.get_estrofe() == 0:
			finalizar_oficina()
	else:
		if oficina.get_estrofe() == 0:
			proxima = oficina.selecionar_proxima()
			for data in proxima:
				action_oficina(data['objeto'],data['participante'])

def finalizar_animacao():
	oficina.finalizar_estrofe()

def adiciona_participante(adicionar,sid):
	participante = get_participante()
	if not participante['nome'].split('.')[0] == 'p':
		oficina.addicionar_participante(participante,sid)
		if adicionar:
			emit('participante-presente',participante, json=True,to=oficina.get_sala())
			if oficina.get_estrofe() > 0:
				print(str(oficina.estado_atual()))		

#remove um partipantes da lista
def remove_participante(sid):
	id = get_participante()['id']
	if not get_participante()['nome'].split('.')[0] == 'p':
		oficina.remover_participante(id,sid)
		emit('remover',id,to=oficina.get_sala())
		emit('remover-participante',id,json=True,to='admin')

def get_participante():
	return {'id':request.cookies.get('id_participante'), 'nome': request.cookies.get('nome'), 'url_avatar': get_url_avatar(request.cookies.get('avatar'))}

def registrar_log(interface,acao,objeto):
	oficina.gravar_log(get_participante(),interface,acao,objeto)

@socket_io.on('remove_participante_oficina',namespace='/desenho')
def remove_participante_oficina(data):
	emit('remover-admin',data['id'],to=oficina.get_sid_participante(data['id']))

@socket_io.on('encerrar_estrofe',namespace='/desenho')
def encerrar_estrofe(data):
	oficina.finalizar_estrofe()
	emit('finalizar_estrofes',{}, json=True,to=oficina.get_sala())

@socket_io.on('teste_server')
def teste_server(data):
	print(data)
	emit('remote_aquarela',{"tag":"teste_client",'qrcode':"teste"},to=sid_arduino)

if __name__=='__main__':
 	#socket_io.run(app, host='0.0.0.0', port=80, debug=True)
	socket_io.run(app, host='0.0.0.0', port=3000, debug=True)
