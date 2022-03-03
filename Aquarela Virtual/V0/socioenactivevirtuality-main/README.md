# Socioenactive Virtuality

Repositório para armazenar as provas de conceito desenvolvidas pelo GT Museu.

## Instalação

Este projeto utiliza [Python](https://www.python.org/downloads/) (versão 3.9.4 no momento da escrita deste documento), instale ou atualize o Python em seu computador conforme necessário. Também são utilizadas algumas bibliotecas que devem ser instaladas com o seguinte comando, a ser executado na pasta do projeto:

```
pip install -r requirements.txt
```

## Execução

Com o Python e as bibliotecas devidamente instalados, a aplicação pode ser executada com o seguinte comando:

```
py aquarela.py
```

Após sua execução, a aplicação fica acessível localmente pelo endereço [localhost:3000](http://localhost:3000) ou [127.0.0.1:3000](http://127.0.0.1:3000).

## Padrão de codificação

snake_case 

As classes ficam na raiz. Templates recebe os arquivos html e static recebe javascript, css, images, fonts.

No servidor aquarela temos um shell script (pull.sh) para fazer pull da última versão no git e reiniciar o serviço.
Comando no shell
$./pull.sh
