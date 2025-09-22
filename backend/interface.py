import customtkinter as ctk
from chavellama import SQLAgent  # sua classe
import threading

# ----------------- Configuração do Agente -----------------
agent = SQLAgent()  # instância do agente

# ----------------- Configuração do CustomTkinter -----------------
ctk.set_appearance_mode("Dark")  # Modo escuro
ctk.set_default_color_theme("blue")  # Tema azul

# ----------------- Funções -----------------
def enviar_pergunta(event=None):
    pergunta = entrada.get().strip()
    if pergunta == "" or pergunta == placeholder_text:
        return
    
    adicionar_mensagem(pergunta, "usuario")
    entrada.delete(0, ctk.END)
    
    # Mostrar indicador de digitação do agente
    adicionar_indicador_digitacao()
    
    # Processar a pergunta em uma thread separada para não travar a interface
    thread = threading.Thread(target=processar_pergunta, args=(pergunta,))
    thread.daemon = True
    thread.start()

def processar_pergunta(pergunta):
    try:
        resposta = agent.process_natural_query(pergunta)
    except Exception as e:
        resposta = "As requisições da chave API gratuita expiraram"
        print(f"Erro ao consultar agente: {e}")
    
    # Remover indicador e mostrar resposta
    janela.after(0, lambda: remover_indicador_digitacao())
    janela.after(0, lambda: adicionar_mensagem(resposta, "agente"))

def adicionar_mensagem(texto, quem="usuario"):
    frame = ctk.CTkFrame(chat_container, fg_color="transparent", corner_radius=0)
    frame.pack(fill="x", pady=(5, 0))
    
    if quem == "usuario":
        # Mensagem do usuário (alinhada à direita)
        ctk.CTkFrame(frame, fg_color="transparent", width=100).pack(side="left", fill="x", expand=True)
        balao = ctk.CTkFrame(frame, fg_color="#3B8ED0", corner_radius=15)
        balao.pack(side="right")
        
        mensagem = ctk.CTkLabel(
            balao, 
            text=texto,
            text_color="#FFFFFF", 
            font=("Montserrat", 12),
            wraplength=300,
            justify="left"
        )
        mensagem.pack(padx=12, pady=8)
    else:
        # Mensagem do agente (alinhada à esquerda)
        ctk.CTkFrame(frame, fg_color="transparent", width=100).pack(side="right", fill="x", expand=True)
        
        # Container com avatar
        container_msg = ctk.CTkFrame(frame, fg_color="transparent")
        container_msg.pack(side="left")
        
        # Avatar do agente
        avatar = ctk.CTkLabel(
            container_msg, 
            text="🤖", 
            font=("Arial", 16),
            width=30,
            height=30
        )
        avatar.pack(side="left", padx=(0, 5))
        
        balao = ctk.CTkFrame(container_msg, fg_color="#2B2B2B", corner_radius=15)
        balao.pack(side="left")
        
        mensagem = ctk.CTkLabel(
            balao, 
            text=texto,
            text_color="#FFFFFF", 
            font=("Montserrat", 12),
            wraplength=300,
            justify="left"
        )
        mensagem.pack(padx=12, pady=8)
    
    # Atualizar a tela e fazer scroll para o final
    chat_canvas._parent_canvas.yview_moveto(1.0)

def adicionar_indicador_digitacao():
    global indicador_digitacao
    frame = ctk.CTkFrame(chat_container, fg_color="transparent")
    frame.pack(fill="x", pady=(5, 0))
    
    ctk.CTkFrame(frame, fg_color="transparent", width=100).pack(side="right", fill="x", expand=True)
    
    # Container com avatar
    container_msg = ctk.CTkFrame(frame, fg_color="transparent")
    container_msg.pack(side="left")
    
    # Avatar do agente
    avatar = ctk.CTkLabel(
        container_msg, 
        text="🤖", 
        font=("Arial", 16),
        width=30,
        height=30
    )
    avatar.pack(side="left", padx=(0, 5))
    
    balao = ctk.CTkFrame(container_msg, fg_color="#2B2B2B", corner_radius=15)
    balao.pack(side="left")
    
    indicador = ctk.CTkLabel(
        balao, 
        text="...",
        text_color="#AAAAAA", 
        font=("Montserrat", 12)
    )
    indicador.pack(padx=12, pady=8)
    
    indicador_digitacao = frame
    chat_canvas._parent_canvas.yview_moveto(1.0)

def remover_indicador_digitacao():
    global indicador_digitacao
    if indicador_digitacao:
        indicador_digitacao.destroy()
        indicador_digitacao = None

def on_entry_click(event):
    if entrada.get() == placeholder_text:
        entrada.delete(0, ctk.END)
        entrada.configure(text_color="#FFFFFF")

def on_focusout(event):
    if entrada.get().strip() == '':
        entrada.insert(0, placeholder_text)
        entrada.configure(text_color="gray")

def fechar():
    agent.close()
    janela.destroy()

# ----------------- Janela Principal -----------------
janela = ctk.CTk()
janela.title("Flex Agent Chat")
janela.geometry("800x650")
janela.minsize(600, 500)

# Centralizar a janela na tela
janela.update_idletasks()
width = janela.winfo_width()
height = janela.winfo_height()
x = (janela.winfo_screenwidth() // 2) - (width // 2)
y = (janela.winfo_screenheight() // 2) - (height // 2)
janela.geometry(f"{width}x{height}+{x}+{y}")

# ----------------- Header -----------------
header = ctk.CTkFrame(janela, height=70, corner_radius=0, fg_color="#1A1A1A")
header.pack(fill="x", side="top")
header.pack_propagate(False)

ctk.CTkLabel(
    header, 
    text="Flex Agent", 
    text_color="#FFFFFF", 
    font=("Montserrat", 20, "bold")
).pack(side="left", padx=20)

status_label = ctk.CTkLabel(
    header, 
    text="Conectado", 
    text_color="#3B8ED0", 
    font=("Montserrat", 12)
)
status_label.pack(side="right", padx=20)

# ----------------- Área de Chat -----------------
chat_frame = ctk.CTkFrame(janela, fg_color="#1F1F1F", corner_radius=10)
chat_frame.pack(fill="both", expand=True, padx=20, pady=10)

# Canvas e Scrollbar para o chat
chat_canvas = ctk.CTkScrollableFrame(
    chat_frame, 
    fg_color="#1F1F1F",
    scrollbar_button_color="#2B2B2B",
    scrollbar_button_hover_color="#3B3B3B"
)
chat_canvas.pack(fill="both", expand=True, padx=5, pady=5)

# Container para as mensagens
chat_container = chat_canvas

# ----------------- Frame de Entrada -----------------
entrada_frame = ctk.CTkFrame(janela, height=80, fg_color="#1A1A1A", corner_radius=0)
entrada_frame.pack(fill="x", side="bottom")
entrada_frame.pack_propagate(False)

# Campo de entrada com placeholder
placeholder_text = "O que você está buscando no S.C.U?"

entrada = ctk.CTkEntry(
    entrada_frame,
    placeholder_text=placeholder_text,
    font=("Montserrat", 12),
    height=40,
    border_width=0,
    fg_color="#2B2B2B",
    text_color="gray",
)
entrada.pack(side="left", fill="x", expand=True, padx=(20, 10), pady=20)
entrada.bind("<Return>", enviar_pergunta)
entrada.bind("<FocusIn>", on_entry_click)
# Não há evento FocusOut direto no CTkEntry, então usamos uma abordagem diferente

# Botão Enviar
botao_enviar = ctk.CTkButton(
    entrada_frame, 
    text="Enviar", 
    command=enviar_pergunta,
    width=80,
    height=40,
    font=("Montserrat", 12, "bold"),
    fg_color="#3B8ED0",
    hover_color="#2A6CAF"
)
botao_enviar.pack(side="right", padx=(0, 20), pady=20)

# Variável para o indicador de digitação
indicador_digitacao = None

# ----------------- Rodapé -----------------
rodape = ctk.CTkLabel(
    janela, 
    text="Powered by Flex Agent", 
    text_color="#666666", 
    font=("Montserrat", 10)
)
rodape.pack(side="bottom", pady=(0, 5))

# ----------------- Loop Principal -----------------
janela.protocol("WM_DELETE_WINDOW", fechar)
janela.mainloop()