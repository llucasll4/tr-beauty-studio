# TR Beauty Studio Suite

Quero criar um aplicativo web completo, profissional e responsivo para um Studio de Nail Design chamado:

TR Beauty Concept

Profissional:
Thalita Rebeca | Nail Design

Instagram:
@_thalitanaildesign

Localização:
Diadema/SP

O aplicativo deve funcionar principalmente em celulares/iPhone, mas também ser totalmente responsivo para computador.

IMPORTANTE:

Não quero apenas um site ou uma agenda visual.

Quero criar um sistema completo para o Studio, com:

- Perfil digital do Studio
- Portfólio de trabalhos
- Catálogo de serviços
- Agendamento online
- Agenda administrativa
- Cadastro e histórico de clientes
- Controle financeiro
- Dashboard
- Gestão de horários
- Área exclusiva para clientes
- Área administrativa exclusiva para a proprietária
- Autenticação
- Banco de dados
- Controle de permissões

O sistema deve funcionar de verdade, conectado ao banco de dados, e não ser apenas uma demonstração visual.

Utilize as imagens do Instagram que estou anexando como referência visual para a identidade da marca.

==================================================
1. IDENTIDADE VISUAL
==================================================

Quero que o aplicativo tenha a mesma sensação visual do Instagram da Thalita.

O perfil possui uma estética sofisticada, elegante, feminina e minimalista, com foco em unhas naturais e elegantes.

Referência de posicionamento:

"Especialista em unhas naturais e elegantes"
"Acabamento fino • Alta durabilidade"

Criar uma identidade visual:

- Premium
- Elegante
- Minimalista
- Feminina
- Sofisticada
- Clean
- Moderna

Utilizar principalmente:

- Off-white
- Creme
- Nude
- Bege
- Branco
- Marrom suave
- Preto em pequenos detalhes
- Champagne/dourado de forma discreta

Evitar:

- Rosa excessivo
- Visual infantil
- Cores muito fortes
- Excesso de elementos
- Aparência de aplicativo genérico

Utilizar tipografia elegante, bastante espaço em branco, cards sofisticados, bordas arredondadas, sombras suaves e ícones minimalistas.

As fotos das unhas devem ser valorizadas.

==================================================
2. ESTRUTURA PRINCIPAL
==================================================

O aplicativo terá dois tipos de usuários:

1. ADMIN
2. CLIENTE

Cada tipo de usuário terá permissões completamente diferentes.

O sistema deve utilizar autenticação real.

Utilizar:

React
TypeScript
Tailwind CSS
shadcn/ui
Supabase

Utilizar Supabase Auth para autenticação e PostgreSQL para banco de dados.

Implementar Row Level Security (RLS).

As permissões devem ser protegidas também no backend/banco de dados e não somente escondendo elementos da interface.

==================================================
3. CONTA ADMINISTRATIVA
==================================================

A proprietária, Thalita, terá uma conta ADMIN.

A ADMIN terá acesso completo ao Studio.

Criar um Dashboard administrativo.

O Dashboard deve mostrar:

- Agendamentos de hoje
- Próximo atendimento
- Quantidade de atendimentos hoje
- Horários disponíveis
- Faturamento do dia
- Faturamento da semana
- Faturamento do mês
- Quantidade de clientes
- Novas clientes
- Serviços mais realizados
- Serviços que mais geram faturamento
- Taxa de cancelamento

Criar atalhos:

+ Novo agendamento
+ Nova cliente
+ Novo serviço
+ Adicionar foto
+ Bloquear horário

==================================================
4. NAVEGAÇÃO ADMIN
==================================================

A ADMIN deve possuir uma navegação simples e profissional.

Principais áreas:

Dashboard
Agenda
Clientes
Serviços
Portfólio
Financeiro
Marketing
Configurações

No celular, utilizar navegação inferior ou menu adaptado para mobile.

No computador, utilizar sidebar.

==================================================
5. AGENDA ADMINISTRATIVA
==================================================

Criar uma agenda completa.

Visualizações:

- Dia
- Semana
- Mês

Cada agendamento deve mostrar:

- Nome da cliente
- Serviço
- Data
- Horário
- Duração
- Valor
- Status
- Forma de pagamento
- Observações

Status possíveis:

- Agendado
- Confirmado
- Concluído
- Cancelado
- Não compareceu

A ADMIN poderá:

- Criar agendamento manualmente
- Editar agendamento
- Reagendar
- Cancelar
- Confirmar
- Marcar como concluído
- Criar encaixe
- Bloquear horário

O sistema nunca deve permitir dois agendamentos no mesmo horário.

==================================================
6. CONFIGURAÇÃO DOS HORÁRIOS
==================================================

A ADMIN poderá definir os horários de funcionamento do Studio.

Permitir configurar:

Segunda
Terça
Quarta
Quinta
Sexta
Sábado
Domingo

Para cada dia:

- Ativo/inativo
- Horário inicial
- Horário final
- Intervalos

Também permitir configurar:

- Férias
- Folgas
- Feriados
- Horários bloqueados
- Intervalos entre atendimentos

Os horários disponíveis para as clientes devem ser calculados automaticamente com base nessas configurações e nos agendamentos existentes.

Quando uma cliente reservar um horário, ele deve imediatamente deixar de aparecer como disponível.

==================================================
7. SERVIÇOS
==================================================

Criar uma área completa para gerenciamento de serviços.

Somente ADMIN poderá criar, editar ou remover serviços.

Cada serviço terá:

- Nome
- Descrição
- Categoria
- Preço
- Duração
- Foto
- Status ativo/inativo

Exemplos:

- Alongamento
- Manutenção
- Banho de gel
- Esmaltação em gel
- Blindagem
- Nail Art
- Remoção
- Outros

A ADMIN poderá alterar:

- Nome
- Descrição
- Preço
- Duração
- Foto
- Status

Serviços inativos não podem aparecer para clientes.

==================================================
8. ÁREA PÚBLICA / PERFIL DO STUDIO
==================================================

Criar uma página pública bonita que funcione como o "Instagram profissional" do Studio.

No topo:

TR Beauty Concept

Thalita Rebeca | Nail Design

"Especialista em unhas naturais e elegantes"

"Acabamento fino • Alta durabilidade"

📍 Diadema/SP

Criar botões:

AGENDAR HORÁRIO
WHATSAPP
INSTAGRAM

A página deve mostrar o portfólio do Studio.

Criar um grid de fotos inspirado no Instagram.

As imagens devem ter bastante destaque.

Criar categorias:

- Resultados
- Experiências
- Biossegurança
- Serviços
- Nail Art
- Unhas naturais

A ADMIN poderá gerenciar essas categorias.

==================================================
9. PORTFÓLIO
==================================================

Criar uma área de gerenciamento de fotos.

Somente ADMIN poderá:

- Adicionar foto
- Remover foto
- Editar foto
- Adicionar título
- Adicionar descrição
- Escolher categoria
- Reordenar fotos

As fotos devem aparecer na área pública/clientes em um grid elegante.

Permitir futuramente adicionar vídeos/Reels.

==================================================
10. CONTA DA CLIENTE
==================================================

Criar uma conta completamente diferente da ADMIN.

A CLIENTE terá uma experiência simples, visual e intuitiva.

Ela poderá:

- Criar conta
- Fazer login
- Editar seus dados
- Ver o perfil do Studio
- Ver fotos
- Ver serviços
- Ver preços
- Ver duração dos serviços
- Agendar horário
- Ver seus próximos agendamentos
- Ver histórico dos próprios atendimentos
- Cancelar ou solicitar reagendamento
- Entrar em contato pelo WhatsApp

A CLIENTE NÃO poderá:

- Ver outras clientes
- Ver agenda completa
- Ver faturamento
- Alterar serviços
- Alterar preços
- Alterar horários do Studio
- Bloquear horários
- Ver configurações administrativas
- Ver observações internas
- Alterar dados de outras clientes

A cliente somente terá acesso aos próprios dados.

==================================================
11. EXPERIÊNCIA DA CLIENTE
==================================================

A experiência da cliente deve parecer um mini aplicativo do Studio.

A navegação principal pode ser:

🏠 Início
💅 Serviços
📸 Portfólio
📅 Agendar
❤️ Meus horários

No início mostrar:

Foto/logo do Studio
Nome da profissional
Descrição
Localização
Botão AGENDAR HORÁRIO
Portfólio
Serviços em destaque
Instagram
WhatsApp

==================================================
12. FLUXO DE AGENDAMENTO
==================================================

Criar um processo extremamente simples.

A cliente clica em:

"AGENDAR HORÁRIO"

Depois:

ETAPA 1:
Escolher serviço.

Mostrar:

Nome
Foto
Descrição
Preço
Duração

ETAPA 2:
Escolher data.

ETAPA 3:
Mostrar somente horários disponíveis.

ETAPA 4:
Confirmar dados.

Nome
Telefone
WhatsApp

ETAPA 5:
Confirmar agendamento.

Depois mostrar:

"Agendamento confirmado! 💅"

Mostrar:

Serviço
Data
Horário
Duração
Valor
Endereço

Botões:

ADICIONAR AO CALENDÁRIO
FALAR NO WHATSAPP

==================================================
13. CLIENTES
==================================================

A ADMIN terá uma área "Clientes".

Mostrar:

- Nome
- Telefone
- WhatsApp
- Instagram
- Primeiro atendimento
- Último atendimento
- Quantidade de atendimentos
- Valor total gasto

Ao clicar em uma cliente, abrir uma página com:

Dados pessoais
Histórico de agendamentos
Serviços realizados
Valor gasto
Último atendimento
Próximo atendimento
Observações internas
Fotos dos trabalhos realizados

IMPORTANTE:

As observações internas da ADMIN nunca podem aparecer para a cliente.

==================================================
14. HISTÓRICO DA CLIENTE
==================================================

Cada cliente deve possuir um histórico.

Exemplo:

12/08/2026
Alongamento
R$ XXX
Concluído

10/09/2026
Manutenção
R$ XXX
Concluído

15/10/2026
Esmaltação em gel
R$ XXX
Concluído

A ADMIN poderá visualizar o histórico completo.

A CLIENTE poderá visualizar somente o próprio histórico.

==================================================
15. FINANCEIRO
==================================================

Criar uma área financeira exclusiva para ADMIN.

Registrar automaticamente o valor quando um atendimento for concluído.

Formas de pagamento:

- Pix
- Dinheiro
- Cartão de crédito
- Cartão de débito
- Outros

Mostrar:

- Faturamento diário
- Faturamento semanal
- Faturamento mensal
- Faturamento anual
- Ticket médio
- Quantidade de atendimentos
- Serviço mais vendido
- Serviço que mais gera faturamento
- Forma de pagamento mais utilizada

Criar gráficos simples, elegantes e fáceis de entender.

A CLIENTE nunca poderá acessar essa área.

==================================================
16. FIDELIDADE
==================================================

Criar sistema de fidelidade.

A ADMIN poderá configurar uma regra.

Exemplo:

"A cada 5 atendimentos, ganhe um benefício."

Mostrar para a cliente:

"Você está em 3 de 5 atendimentos para ganhar seu benefício."

Permitir configurar:

- Número de atendimentos
- Benefício
- Validade

==================================================
17. CUPONS E PROMOÇÕES
==================================================

Criar sistema de cupons.

A ADMIN poderá criar:

- Cupom percentual
- Cupom de valor fixo
- Data de início
- Data de validade
- Quantidade máxima
- Serviço específico
- Todos os serviços

A cliente poderá inserir o cupom durante o agendamento.

O sistema deve validar automaticamente.

==================================================
18. WHATSAPP
==================================================

Adicionar integração prática com WhatsApp.

Criar botões:

"Falar no WhatsApp"

"Enviar confirmação"

"Enviar lembrete"

"Enviar reagendamento"

"Enviar cancelamento"

Criar mensagens pré-preenchidas.

Exemplo:

"Olá, Thalita! Gostaria de agendar um horário no TR Beauty Concept."

Para lembrete:

"Olá, [nome]! 💅 Seu horário no TR Beauty Concept está confirmado para [data] às [horário]. Serviço: [serviço]. Te esperamos!"

Utilizar WhatsApp de forma prática, sem criar uma integração complexa inicialmente.

Deixar a arquitetura preparada para futuramente utilizar WhatsApp Business API para mensagens automáticas.

==================================================
19. LEMBRETES
==================================================

Preparar o sistema para lembretes automáticos.

Criar lembretes para:

- Confirmação
- 24 horas antes
- No dia do atendimento
- Pós-atendimento
- Aniversário

Inicialmente, permitir envio através do WhatsApp.

Deixar arquitetura preparada para automação futura.

==================================================
20. MARKETING
==================================================

Criar uma área simples de marketing.

A ADMIN poderá visualizar:

- Clientes que não retornam há 30 dias
- Clientes que não retornam há 60 dias
- Clientes aniversariantes
- Clientes mais frequentes
- Clientes que mais gastam
- Clientes novas
- Clientes inativas

Permitir selecionar uma cliente e abrir o WhatsApp.

==================================================
21. ANIVERSÁRIOS
==================================================

No cadastro da cliente permitir data de nascimento.

Criar uma lista de aniversariantes.

Exemplo:

"Aniversariantes deste mês"

Permitir enviar mensagem pelo WhatsApp:

"Oi, [nome]! 💕 Feliz aniversário! Para comemorar seu dia, o TR Beauty Concept preparou uma condição especial para você."

==================================================
22. CONFIGURAÇÕES
==================================================

A ADMIN poderá configurar:

Nome do Studio
Logo
Foto de perfil
Foto de capa
Descrição
Instagram
WhatsApp
Endereço
Horários
Dias de funcionamento
Feriados
Política de cancelamento
Tempo mínimo para cancelamento
Intervalo entre atendimentos
Formas de pagamento
Regras de fidelidade

==================================================
23. POLÍTICA DE CANCELAMENTO
==================================================

Criar configurações para a ADMIN definir:

- Prazo mínimo para cancelamento
- Prazo mínimo para reagendamento
- Se a cliente pode cancelar diretamente
- Se precisa solicitar cancelamento
- Política de no-show

Exemplo:

"Cancelamentos e reagendamentos devem ser realizados com pelo menos 24 horas de antecedência."

Essa regra deve ser aplicada pelo sistema.

==================================================
24. NOTIFICAÇÕES
==================================================

Criar notificações dentro do aplicativo.

Para ADMIN:

- Novo agendamento
- Cancelamento
- Reagendamento
- Nova cliente

Para CLIENTE:

- Agendamento confirmado
- Agendamento alterado
- Agendamento cancelado
- Lembrete

==================================================
25. BANCO DE DADOS
==================================================

Utilizar Supabase PostgreSQL.

Criar estrutura organizada para:

profiles
users
studio
clients
services
appointments
payments
portfolio
portfolio_categories
business_hours
blocked_times
settings
coupons
loyalty
notifications

Relacionar corretamente todas as entidades.

Preparar a arquitetura para futuramente permitir vários Studios utilizando o mesmo sistema.

Cada Studio deverá possuir seus próprios dados.

==================================================
26. SEGURANÇA
==================================================

Implementar autenticação real com Supabase Auth.

Criar controle de acesso baseado em função:

ADMIN
CLIENTE

Implementar RLS.

Garantir que:

ADMIN tenha acesso aos dados do próprio Studio.

CLIENTE tenha acesso somente aos próprios dados.

CLIENTE não consiga consultar dados de outras clientes.

CLIENTE não consiga consultar faturamento.

CLIENTE não consiga alterar serviços.

CLIENTE não consiga alterar agenda.

CLIENTE não consiga acessar configurações administrativas.

CLIENTE não consiga acessar observações internas.

Não confiar somente no frontend para segurança.

==================================================
27. RESPONSIVIDADE
==================================================

O aplicativo será utilizado principalmente em iPhone.

Priorizar Mobile First.

Testar visualmente em:

iPhone
Android
Tablet
Desktop

A experiência mobile deve ser excelente.

Botões grandes o suficiente para toque.

Formulários simples.

Navegação rápida.

Evitar excesso de informação na tela.

==================================================
28. PÁGINA INICIAL
==================================================

Criar uma página inicial premium.

Estrutura sugerida:

Logo/foto do Studio

TR Beauty Concept

Thalita Rebeca
Nail Design

"Especialista em unhas naturais e elegantes"

"Acabamento fino • Alta durabilidade"

📍 Diadema/SP

[ AGENDAR HORÁRIO ]

[ WHATSAPP ]

Depois:

"Conheça nosso trabalho"

Grid de fotos.

Depois:

"Serviços"

Cards com os principais serviços.

Depois:

"Por que escolher o TR Beauty Concept?"

- Acabamento fino
- Alta durabilidade
- Atendimento personalizado
- Biossegurança
- Especialização em unhas naturais

Depois:

"Agende seu horário"

[ AGENDAR ]

==================================================
29. DESIGN DA AGENDA
==================================================

A agenda da ADMIN deve ser uma das áreas mais importantes.

No celular:

Mostrar o dia atual.

Exemplo:

QUARTA-FEIRA
12 AGOSTO

09:00
Cliente
Serviço

11:00
Cliente
Serviço

14:00
Cliente
Serviço

16:00
Disponível

18:00
Cliente
Serviço

Permitir deslizar entre dias.

Adicionar botão:

+ NOVO AGENDAMENTO

==================================================
30. EXPERIÊNCIA PREMIUM
==================================================

Quero que o resultado final pareça um produto comercial profissional.

Não quero:

- Dashboard genérico
- Cores aleatórias
- Componentes sem identidade
- Visual de sistema antigo
- Excesso de tabelas
- Interface poluída

Quero algo semelhante à qualidade visual de aplicativos modernos de agendamento e beleza.

O Studio deve parecer uma marca premium.

==================================================
31. FUTURO — PREPARAR PARA SAAS
==================================================

Mesmo que inicialmente o aplicativo seja utilizado somente pela Thalita, criar a arquitetura pensando em expansão futura.

No futuro quero poder transformar o sistema em uma plataforma para várias Nail Designers.

Cada profissional poderia ter:

- Sua própria conta
- Seu próprio Studio
- Seu próprio perfil
- Seus próprios serviços
- Seus próprios preços
- Sua própria agenda
- Suas próprias clientes
- Seu próprio portfólio
- Seu próprio link de agendamento

Exemplo futuro:

app.com/thalitanaildesign

Cada profissional terá seus dados completamente separados.

Não implementar cobrança SaaS agora, mas deixar a arquitetura preparada para isso.

==================================================
32. PRIORIDADE DE DESENVOLVIMENTO
==================================================

Priorizar nesta ordem:

1. Estrutura do projeto
2. Banco de dados
3. Supabase Auth
4. Sistema ADMIN/CLIENTE
5. Permissões e RLS
6. Dashboard ADMIN
7. Agenda
8. Horários disponíveis
9. Serviços
10. Agendamento das clientes
11. Perfil público do Studio
12. Portfólio
13. Clientes
14. Histórico
15. Financeiro
16. WhatsApp
17. Fidelidade
18. Cupons
19. Marketing
20. Configurações

Não criar somente telas estáticas.

Todas as funcionalidades principais devem estar conectadas ao banco de dados e funcionando.

==================================================
33. RESULTADO ESPERADO
==================================================

Quero duas experiências completamente diferentes.

CLIENTE:

🏠 Início
📸 Portfólio
💅 Serviços
📅 Agendar
❤️ Meus horários
📱 WhatsApp

A cliente entra, vê o trabalho da Thalita, escolhe um serviço e consegue marcar seu horário rapidamente.

ADMIN:

📊 Dashboard
📅 Agenda
👩 Clientes
💅 Serviços
📸 Portfólio
💰 Financeiro
📣 Marketing
⚙️ Configurações

A ADMIN deve conseguir administrar praticamente todo o Studio pelo aplicativo.

O resultado final deve ser um aplicativo completo, bonito, moderno, premium, seguro e funcional.

Use as imagens anexadas do Instagram como referência visual principal.

Não copie literalmente o Instagram.

Crie uma identidade própria para o aplicativo baseada naquela estética.

Priorize uma experiência excelente no celular.

Antes de finalizar, verifique se:

- O login funciona
- ADMIN e CLIENTE possuem permissões diferentes
- Cliente não consegue acessar área administrativa
- Cliente consegue criar agendamento
- Horários ocupados não aparecem para outras clientes
- ADMIN consegue visualizar os agendamentos
- ADMIN consegue criar e editar serviços
- ADMIN consegue gerenciar fotos
- Cliente consegue visualizar portfólio
- Cliente consegue visualizar serviços
- Cliente consegue visualizar seus próprios agendamentos
- Financeiro é exclusivo da ADMIN
- RLS está configurado corretamente
- Layout funciona perfeitamente no mobile

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3013096a-41fe-4ff4-89ca-0d75bfb70640).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
