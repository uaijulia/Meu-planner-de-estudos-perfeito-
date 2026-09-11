## 🧪 Testes manuais realizados

Como parte da minha prática de QA, testei manualmente os principais fluxos do app:

| # | Cenário | Resultado esperado | Resultado obtido | Status |
|---|---------|---------------------|---------------------|--------|
| 1 | Enviar formulário vazio | Não permite cadastrar sem preencher os campos | Nada é adicionado, validação bloqueia o envio | ✅ Passou |
| 2 | Data de prova no passado | Mostra aviso de que a prova já passou | Disciplina é inserida e exibe corretamente "prova já passou" | ✅ Passou |
| 3 | Prova hoje | Mostra destaque de urgência | Exibe "é hoje!" em vermelho | ✅ Passou |
| 4 | Cálculo de progresso (2 de 3 tópicos concluídos) | Barra e texto mostram 67% | Exibido corretamente como 67% | ✅ Passou |
| 5 | Remover todos os tópicos | Progresso volta a 0% | Barra volta para 0%, como esperado | ✅ Passou |
| 6 | Persistência após recarregar (F5) | Dados continuam salvos | Disciplinas seguem cadastradas, localStorage funcionando corretamente | ✅ Passou |
| 7 | Ordenação por data | Ordena da mais urgente pra mais distante | Ordem correta: prova atrasada → prova de hoje → mais distante | ✅ Passou |

Todos os cenários testados passaram sem falhas encontradas até o momento.
