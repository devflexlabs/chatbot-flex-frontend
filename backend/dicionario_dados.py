# dicionario_dados.py
DATA_DICTIONARY = {
    "clientes": {
        # Identificação básica
        "email": "Endereço de email do cliente",
        "full_name": "Nome completo do cliente",
        "phone": "Número de telefone do cliente",
        "birth_date": "Data de nascimento do cliente",
        "cpf": "CPF do cliente (formato 000.000.000-00)",
        
        # Detalhes do caso/dívida
        "case_id": "ID único do caso/dívida",
        "case_product": "Tipo de produto financeiro (empréstimo, cartão, financiamento, etc.)",
        "case_bank_name": "Nome do banco ou instituição financeira",
        "case_installments_total": "Número total de parcelas do contrato",
        "case_paid_installments": "Número de parcelas já pagas",
        "case_installments_value": "Valor de cada parcela (decimal)",
        "case_debt_amount": "Valor total da dívida (decimal)",
        "case_paid_debt_amount": "Valor total já pago da dívida (decimal)",
        "case_accounting_analysis": "Análise contábil específica do caso",
        "case_deal_info": "Informações de acordos",
        "case_post": "Postagens na página do cliente relacionadas ao caso",
        
        # Endereço completo
        "client_address_street": "Nome da rua do endereço",
        "client_address_number": "Número do endereço",
        "client_address_complement": "Complemento do endereço",
        "client_address_neighbourhood": "Bairro do endereço",
        "client_address_city": "Cidade do endereço",
        "client_address_state": "Estado (UF) do endereço",
        "client_address_country": "País do endereço (provavelmente Brasil)",
        "client_address_cep": "CEP do endereço (formato 00000-000)",
        
        # Informações de financiamento/veículo
        "financing_info_license_plate": "Placa do veículo (formato ABC-1D23)",
        "financing_info_vehicle_color": "Cor do veículo",
        "financing_info_vehicle_model": "Ano de fabricação do veículo",
        "financing_info_vehicle_brand": "Marca e modelo do veículo",
        "financing_info_renavam": "Número RENAVAM do veículo"
    }
}
