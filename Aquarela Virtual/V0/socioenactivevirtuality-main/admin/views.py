from oficina import Oficina
from flask import Blueprint, url_for, render_template, request, redirect, session, make_response
oficina = Oficina.getInstance()
from foto_captura import Foto
from uteis.funcoes import resolve_id
#Configuração Blueprint
bp_admin= Blueprint('admin',__name__,static_folder='static',template_folder='templates')
foto = Foto.getInstance()
#Rotas Blueprint (Módulo admin)
@bp_admin.route('/index', methods=['GET',])
@bp_admin.route('/', methods=['GET',])
def login():
    return render_template('login.html',titulo_pagina='Administração')

@bp_admin.route('/validarfoto', methods=['GET','POST'])
def validar_foto():
    if request.method == "POST":
        print("No post...")
        if 'senha' in request.form:
            print("Senha no forms...")
            if request.form['senha'] == 'interhad':
                print("Validou Senha...")
                resp = make_response(render_template('validar_fotos.html',titulo_pagina='Validar fotos', lista_fotos = foto.listar_arquivos_fotos()))  
                resp.set_cookie('admin',"00000") 
                return resp
            else:
                return render_template('login.html',titulo_pagina='Administração')
    else:
        if 'admin' in request.cookies:
            return render_template('validar_fotos.html', titulo_pagina='Validar fotos', lista_fotos = foto.listar_arquivos_fotos())
        else:
            return render_template('login.html',titulo_pagina='Administração')

