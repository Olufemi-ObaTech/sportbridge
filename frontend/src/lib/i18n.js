export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' },
  { code: 'es', label: 'Español' },
]

const languageIndexes = { fr: 1, pt: 2, ar: 3, es: 4 }

const entries = [
  ['Home', 'Accueil', 'Início', 'الرئيسية', 'Inicio'],
  ['Players', 'Joueurs', 'Jogadores', 'اللاعبون', 'Jugadores'],
  ['Dashboard', 'Tableau de bord', 'Painel', 'لوحة التحكم', 'Panel'],
  ['Explore', 'Explorer', 'Explorar', 'استكشف', 'Explorar'],
  ['Jobs', 'Emplois', 'Vagas', 'الوظائف', 'Empleos'],
  ['Tryouts', 'Essais', 'Testes', 'تجارب الأداء', 'Pruebas'],
  ['Community Feed', 'Fil communautaire', 'Feed da comunidade', 'آخر أخبار المجتمع', 'Comunidad'],
  ['Football', 'Football', 'Futebol', 'كرة القدم', 'Fútbol'],
  ['Basketball', 'Basket-ball', 'Basquetebol', 'كرة السلة', 'Baloncesto'],
  ['Log in', 'Connexion', 'Entrar', 'تسجيل الدخول', 'Iniciar sesión'],
  ['Log out', 'Déconnexion', 'Sair', 'تسجيل الخروج', 'Cerrar sesión'],
  ['Sign in', 'Se connecter', 'Iniciar sessão', 'تسجيل الدخول', 'Iniciar sesión'],
  ['Sign out', 'Se déconnecter', 'Terminar sessão', 'تسجيل الخروج', 'Cerrar sesión'],
  ['Create account', 'Créer un compte', 'Criar conta', 'إنشاء حساب', 'Crear cuenta'],
  ['Create Account', 'Créer un compte', 'Criar conta', 'إنشاء حساب', 'Crear cuenta'],
  ['Create your account', 'Créez votre compte', 'Crie a sua conta', 'أنشئ حسابك', 'Crea tu cuenta'],
  ['Join', 'Rejoindre', 'Participar', 'انضم', 'Unirse'],
  ['Join free today', 'Inscrivez-vous gratuitement', 'Inscreva-se gratuitamente', 'انضم مجانًا اليوم', 'Únete gratis hoy'],
  ['Switch language', 'Changer de langue', 'Mudar idioma', 'تغيير اللغة', 'Cambiar idioma'],
  ['Pricing', 'Tarifs', 'Preços', 'الأسعار', 'Precios'],
  ['Inbox', 'Boîte de réception', 'Caixa de entrada', 'الوارد', 'Bandeja de entrada'],
  ['Notifications', 'Notifications', 'Notificações', 'الإشعارات', 'Notificaciones'],
  ['Back', 'Retour', 'Voltar', 'رجوع', 'Volver'],
  ['Back to home', 'Retour à l’accueil', 'Voltar ao início', 'العودة إلى الصفحة الرئيسية', 'Volver al inicio'],
  ['Back to top', 'Retour en haut', 'Voltar ao topo', 'العودة إلى الأعلى', 'Volver arriba'],
  ['Skip to main content', 'Passer au contenu principal', 'Ir para o conteúdo principal', 'تخطَّ إلى المحتوى الرئيسي', 'Saltar al contenido principal'],
  ['Search', 'Rechercher', 'Pesquisar', 'بحث', 'Buscar'],
  ['Search for player', 'Rechercher un joueur', 'Pesquisar jogador', 'ابحث عن لاعب', 'Buscar jugador'],
  ['Find Players', 'Trouver des joueurs', 'Encontrar jogadores', 'ابحث عن لاعبين', 'Buscar jugadores'],
  ['Filter Players', 'Filtrer les joueurs', 'Filtrar jogadores', 'تصفية اللاعبين', 'Filtrar jugadores'],
  ['Filters', 'Filtres', 'Filtros', 'عوامل التصفية', 'Filtros'],
  ['Player filters', 'Filtres des joueurs', 'Filtros de jogadores', 'عوامل تصفية اللاعبين', 'Filtros de jugadores'],
  ['Sort players', 'Trier les joueurs', 'Ordenar jogadores', 'ترتيب اللاعبين', 'Ordenar jugadores'],
  ['Newest', 'Les plus récents', 'Mais recentes', 'الأحدث', 'Más recientes'],
  ['Most Viewed', 'Les plus consultés', 'Mais vistos', 'الأكثر مشاهدة', 'Más vistos'],
  ['Verified First', 'Vérifiés d’abord', 'Verificados primeiro', 'الموثّقون أولًا', 'Verificados primero'],
  ['Most Complete Profile', 'Profils les plus complets', 'Perfis mais completos', 'الملفات الشخصية الأكثر اكتمالًا', 'Perfiles más completos'],
  ['Filter Jobs', 'Filtrer les emplois', 'Filtrar vagas', 'تصفية الوظائف', 'Filtrar empleos'],
  ['Filter Tryouts', 'Filtrer les essais', 'Filtrar testes', 'تصفية تجارب الأداء', 'Filtrar pruebas'],
  ['Filter Feed', 'Filtrer le fil', 'Filtrar feed', 'تصفية المنشورات', 'Filtrar publicaciones'],
  ['Clear filters', 'Effacer les filtres', 'Limpar filtros', 'مسح عوامل التصفية', 'Borrar filtros'],
  ['Clear all filters', 'Effacer tous les filtres', 'Limpar todos os filtros', 'مسح جميع عوامل التصفية', 'Borrar todos los filtros'],
  ['Reset filters', 'Réinitialiser les filtres', 'Redefinir filtros', 'إعادة ضبط عوامل التصفية', 'Restablecer filtros'],
  ['Show all posts', 'Afficher toutes les publications', 'Mostrar todas as publicações', 'عرض جميع المنشورات', 'Mostrar todas las publicaciones'],
  ['All positions', 'Tous les postes', 'Todas as posições', 'جميع المراكز', 'Todas las posiciones'],
  ['All age groups', 'Tous les groupes d’âge', 'Todos os grupos etários', 'جميع الفئات العمرية', 'Todos los grupos de edad'],
  ['All nationalities', 'Toutes les nationalités', 'Todas as nacionalidades', 'جميع الجنسيات', 'Todas las nacionalidades'],
  ['All ages', 'Tous les âges', 'Todas as idades', 'جميع الأعمار', 'Todas las edades'],
  ['All genders', 'Tous les genres', 'Todos os géneros', 'جميع الأجناس', 'Todos los géneros'],
  ['All regions', 'Toutes les régions', 'Todas as regiões', 'جميع المناطق', 'Todas las regiones'],
  ['All roles', 'Tous les rôles', 'Todas as funções', 'جميع الأدوار', 'Todos los roles'],
  ['All Sports', 'Tous les sports', 'Todos os desportos', 'جميع الرياضات', 'Todos los deportes'],
  ['All types', 'Tous les types', 'Todos os tipos', 'جميع الأنواع', 'Todos los tipos'],
  ['Any', 'Tous', 'Qualquer', 'أيّ', 'Cualquiera'],
  ['Any arrangement', 'Tout type de contrat', 'Qualquer modalidade', 'أي نوع من التعاقد', 'Cualquier modalidad'],
  ['Select', 'Sélectionner', 'Selecionar', 'اختر', 'Seleccionar'],
  ['Select position', 'Sélectionner un poste', 'Selecionar posição', 'اختر المركز', 'Seleccionar posición'],
  ['Select region', 'Sélectionner une région', 'Selecionar região', 'اختر المنطقة', 'Seleccionar región'],
  ['Age', 'Âge', 'Idade', 'العمر', 'Edad'],
  ['Nationality', 'Nationalité', 'Nacionalidade', 'الجنسية', 'Nacionalidad'],
  ['Age Group', 'Tranche d’âge', 'Grupo etário', 'الفئة العمرية', 'Grupo de edad'],
  ['Preferred Foot', 'Pied préféré', 'Pé preferido', 'القدم المفضلة', 'Pie preferido'],
  ['Availability', 'Disponibilité', 'Disponibilidade', 'التوفر', 'Disponibilidad'],
  ['Left', 'Gauche', 'Esquerdo', 'يسار', 'Izquierdo'],
  ['Right', 'Droit', 'Direito', 'يمين', 'Derecho'],
  ['Both', 'Les deux', 'Ambos', 'كلاهما', 'Ambos'],
  ['Available Now', 'Disponible maintenant', 'Disponível agora', 'متاح الآن', 'Disponible ahora'],
  ['Available Jan 2026', 'Disponible en janv. 2026', 'Disponível em jan. de 2026', 'متاح في يناير 2026', 'Disponible en ene. de 2026'],
  ['Available Jul 2026', 'Disponible en juil. 2026', 'Disponível em jul. de 2026', 'متاح في يوليو 2026', 'Disponible en jul. de 2026'],
  ['Under Contract', 'Sous contrat', 'Sob contrato', 'مرتبط بعقد', 'Bajo contrato'],
  ['Country', 'Pays', 'País', 'البلد', 'País'],
  ['Current country', 'Pays actuel', 'País atual', 'البلد الحالي', 'País actual'],
  ['Position', 'Poste', 'Posição', 'المركز', 'Posición'],
  ['Goalkeeper', 'Gardien de but', 'Guarda-redes', 'حارس مرمى', 'Portero'],
  ['Right Back', 'Arrière droit', 'Lateral-direito', 'ظهير أيمن', 'Lateral derecho'],
  ['Left Back', 'Arrière gauche', 'Lateral-esquerdo', 'ظهير أيسر', 'Lateral izquierdo'],
  ['Centre Back', 'Défenseur central', 'Defesa-central', 'قلب دفاع', 'Defensa central'],
  ['Sweeper', 'Libéro', 'Líbero', 'ليبرو', 'Líbero'],
  ['Defensive Mid', 'Milieu défensif', 'Médio defensivo', 'لاعب وسط دفاعي', 'Mediocentro defensivo'],
  ['Central Mid', 'Milieu central', 'Médio-centro', 'لاعب وسط مركزي', 'Mediocentro'],
  ['Attacking Mid', 'Milieu offensif', 'Médio ofensivo', 'لاعب وسط هجومي', 'Mediapunta'],
  ['Right Wing', 'Ailier droit', 'Extremo direito', 'جناح أيمن', 'Extremo derecho'],
  ['Left Wing', 'Ailier gauche', 'Extremo esquerdo', 'جناح أيسر', 'Extremo izquierdo'],
  ['Second Striker', 'Deuxième attaquant', 'Segundo avançado', 'مهاجم ثانٍ', 'Segundo delantero'],
  ['Striker', 'Attaquant', 'Avançado', 'مهاجم', 'Delantero'],
  ['Centre Forward', 'Avant-centre', 'Ponta de lança', 'رأس حربة', 'Delantero centro'],
  ['Full name', 'Nom complet', 'Nome completo', 'الاسم الكامل', 'Nombre completo'],
  ['Name', 'Nom', 'Nome', 'الاسم', 'Nombre'],
  ['Email', 'E-mail', 'E-mail', 'البريد الإلكتروني', 'Correo electrónico'],
  ['Email address', 'Adresse e-mail', 'Endereço de e-mail', 'عنوان البريد الإلكتروني', 'Dirección de correo electrónico'],
  ['Password', 'Mot de passe', 'Palavra-passe', 'كلمة المرور', 'Contraseña'],
  ['Description', 'Description', 'Descrição', 'الوصف', 'Descripción'],
  ['Role', 'Rôle', 'Função', 'الدور', 'Función'],
  ['Status', 'Statut', 'Estado', 'الحالة', 'Estado'],
  ['Type', 'Type', 'Tipo', 'النوع', 'Tipo'],
  ['URL', 'URL', 'URL', 'الرابط', 'URL'],
  ['Date & time', 'Date et heure', 'Data e hora', 'التاريخ والوقت', 'Fecha y hora'],
  ['Free', 'Gratuit', 'Gratuito', 'مجاني', 'Gratis'],
  ['Paid', 'Payant', 'Pago', 'مدفوع', 'De pago'],
  ['Full-time', 'Temps plein', 'Tempo integral', 'دوام كامل', 'Tiempo completo'],
  ['Short-term', 'Courte durée', 'Curta duração', 'قصير الأجل', 'Corta duración'],
  ['Internship', 'Stage', 'Estágio', 'تدريب عملي', 'Prácticas'],
  ['Loan', 'Prêt', 'Empréstimo', 'إعارة', 'Cesión'],
  ['Open to work', 'À la recherche d’un poste', 'Disponível para trabalhar', 'متاح للعمل', 'Disponible para trabajar'],
  ['Open Tryouts', 'Essais ouverts', 'Testes abertos', 'تجارب أداء مفتوحة', 'Pruebas abiertas'],
  ['Verified', 'Vérifié', 'Verificado', 'موثّق', 'Verificado'],
  ['Verified Only', 'Vérifiés uniquement', 'Apenas verificados', 'الموثّقون فقط', 'Solo verificados'],
  ['Verified Free Players', 'Joueurs libres vérifiés', 'Jogadores livres verificados', 'لاعبون أحرار موثّقون', 'Jugadores libres verificados'],
  ['Verified clubs', 'Clubs vérifiés', 'Clubes verificados', 'أندية موثّقة', 'Clubes verificados'],
  ['Academy / Club', 'Académie / Club', 'Academia / Clube', 'أكاديمية / نادٍ', 'Academia / Club'],
  ['Agent / Scout', 'Agent / Recruteur', 'Agente / Olheiro', 'وكيل / كشاف', 'Agente / Ojeador'],
  ['Coach / Manager', 'Entraîneur / Manager', 'Treinador / Gestor', 'مدرب / مدير', 'Entrenador / Director'],
  ['Club', 'Club', 'Clube', 'النادي', 'Club'],
  ['Agent', 'Agent', 'Agente', 'وكيل', 'Agente'],
  ['Scout', 'Recruteur', 'Olheiro', 'كشاف', 'Ojeador'],
  ['Coach', 'Entraîneur', 'Treinador', 'مدرب', 'Entrenador'],
  ['Staff Needed', 'Personnel recherché', 'Vagas para equipa técnica', 'مطلوب موظفون', 'Se busca personal'],
  ['Player Needed', 'Joueur recherché', 'Jogador pretendido', 'مطلوب لاعب', 'Se busca jugador'],
  ['Apply', 'Postuler', 'Candidatar-se', 'تقدّم', 'Solicitar'],
  ['Apply with My Verified Profile', 'Postuler avec mon profil vérifié', 'Candidatar-me com o meu perfil verificado', 'تقدّم بملفي الموثّق', 'Solicitar con mi perfil verificado'],
  ['Post job', 'Publier une offre', 'Publicar vaga', 'نشر وظيفة', 'Publicar empleo'],
  ['Post tryout', 'Publier un essai', 'Publicar teste', 'نشر تجربة أداء', 'Publicar prueba'],
  ['Send Message', 'Envoyer un message', 'Enviar mensagem', 'إرسال رسالة', 'Enviar mensaje'],
  ['Send Recommendation', 'Envoyer une recommandation', 'Enviar recomendação', 'إرسال توصية', 'Enviar recomendación'],
  ['Approve', 'Approuver', 'Aprovar', 'موافقة', 'Aprobar'],
  ['Reject', 'Rejeter', 'Rejeitar', 'رفض', 'Rechazar'],
  ['Deny', 'Refuser', 'Negar', 'رفض', 'Denegar'],
  ['Suspend', 'Suspendre', 'Suspender', 'تعليق', 'Suspender'],
  ['Reactivate', 'Réactiver', 'Reativar', 'إعادة التفعيل', 'Reactivar'],
  ['Dismiss report', 'Classer le signalement', 'Arquivar denúncia', 'إغلاق البلاغ', 'Descartar denuncia'],
  ['Confirm scam & disable account', 'Confirmer la fraude et désactiver le compte', 'Confirmar fraude e desativar conta', 'تأكيد الاحتيال وتعطيل الحساب', 'Confirmar fraude y desactivar cuenta'],
  ['File a Report', 'Signaler', 'Fazer uma denúncia', 'الإبلاغ', 'Presentar una denuncia'],
  ['Submit Report', 'Envoyer le signalement', 'Enviar denúncia', 'إرسال البلاغ', 'Enviar denuncia'],
  ['Cancel', 'Annuler', 'Cancelar', 'إلغاء', 'Cancelar'],
  ['Save profile', 'Enregistrer le profil', 'Guardar perfil', 'حفظ الملف الشخصي', 'Guardar perfil'],
  ['Upload CV', 'Téléverser un CV', 'Carregar currículo', 'رفع السيرة الذاتية', 'Subir CV'],
  ['Upload files', 'Téléverser des fichiers', 'Carregar ficheiros', 'رفع الملفات', 'Subir archivos'],
  ['Retry', 'Réessayer', 'Tentar novamente', 'إعادة المحاولة', 'Reintentar'],
  ['Next', 'Suivant', 'Seguinte', 'التالي', 'Siguiente'],
  ['Previous', 'Précédent', 'Anterior', 'السابق', 'Anterior'],
  ['Mark all as read', 'Tout marquer comme lu', 'Marcar tudo como lido', 'تحديد الكل كمقروء', 'Marcar todo como leído'],
  ['Loading…', 'Chargement…', 'A carregar…', 'جارٍ التحميل…', 'Cargando…'],
  ['Loading your dashboard…', 'Chargement de votre tableau de bord…', 'A carregar o seu painel…', 'جارٍ تحميل لوحة التحكم…', 'Cargando tu panel…'],
  ['Checking account access…', 'Vérification de l’accès au compte…', 'A verificar o acesso à conta…', 'جارٍ التحقق من الوصول إلى الحساب…', 'Comprobando el acceso a la cuenta…'],
  ['Account access unavailable', 'Accès au compte indisponible', 'Acesso à conta indisponível', 'الوصول إلى الحساب غير متاح', 'Acceso a la cuenta no disponible'],
  ['No jobs match your filters', 'Aucune offre ne correspond à vos filtres', 'Nenhuma vaga corresponde aos filtros', 'لا توجد وظائف تطابق عوامل التصفية', 'Ningún empleo coincide con los filtros'],
  ['No tryouts match your filters', 'Aucun essai ne correspond à vos filtres', 'Nenhum teste corresponde aos filtros', 'لا توجد تجارب أداء تطابق عوامل التصفية', 'Ninguna prueba coincide con los filtros'],
  ['No players match your filters', 'Aucun joueur ne correspond à vos filtres', 'Nenhum jogador corresponde aos filtros', 'لا يوجد لاعبون يطابقون عوامل التصفية', 'Ningún jugador coincide con los filtros'],
  ['No posts yet', 'Aucune publication pour le moment', 'Ainda não há publicações', 'لا توجد منشورات بعد', 'Aún no hay publicaciones'],
  ['No notifications yet.', 'Aucune notification pour le moment.', 'Ainda não há notificações.', 'لا توجد إشعارات بعد.', 'Aún no hay notificaciones.'],
  ['No conversations yet.', 'Aucune conversation pour le moment.', 'Ainda não há conversas.', 'لا توجد محادثات بعد.', 'Aún no hay conversaciones.'],
  ['No messages yet. Start a conversation by visiting a player or agent profile.', 'Aucun message. Consultez le profil d’un joueur ou d’un agent pour démarrer une conversation.', 'Ainda não há mensagens. Visite o perfil de um jogador ou agente para iniciar uma conversa.', 'لا توجد رسائل بعد. ابدأ محادثة بزيارة ملف لاعب أو وكيل.', 'Aún no hay mensajes. Visita el perfil de un jugador o agente para iniciar una conversación.'],
  ['No pending verification requests.', 'Aucune demande de vérification en attente.', 'Não há pedidos de verificação pendentes.', 'لا توجد طلبات تحقق معلّقة.', 'No hay solicitudes de verificación pendientes.'],
  ['No videos uploaded yet.', 'Aucune vidéo téléversée pour le moment.', 'Ainda não foram carregados vídeos.', 'لم يتم رفع أي فيديو بعد.', 'Aún no se han subido vídeos.'],
  ['No achievements listed yet.', 'Aucune distinction indiquée pour le moment.', 'Ainda não há conquistas listadas.', 'لم تُضف إنجازات بعد.', 'Aún no hay logros.'],
  ['No club history added yet.', 'Aucun historique de club ajouté pour le moment.', 'Ainda não foi adicionado o histórico de clubes.', 'لم تتم إضافة سجل الأندية بعد.', 'Aún no se ha añadido el historial de clubes.'],
  ['A connected sporting world', 'Un monde sportif connecté', 'Um mundo desportivo conectado', 'عالم رياضي مترابط', 'Un mundo deportivo conectado'],
  ['Every level. Every ambition.', 'Tous les niveaux. Toutes les ambitions.', 'Todos os níveis. Todas as ambições.', 'كل المستويات. كل الطموحات.', 'Todos los niveles. Todas las ambiciones.'],
  ['One platform, every side of the game', 'Une plateforme pour tous les acteurs du jeu', 'Uma plataforma para todos os intervenientes do desporto', 'منصة واحدة لكل أطراف اللعبة', 'Una plataforma para todos los actores del deporte'],
  ['From the pitch to the next opportunity.', 'Du terrain à votre prochaine opportunité.', 'Do campo à próxima oportunidade.', 'من الملعب إلى فرصتك التالية.', 'Del campo a tu próxima oportunidad.'],
  ['Join SportBridge today, free for players. Takes one minute.', 'Rejoignez SportBridge gratuitement. Inscription en une minute.', 'Junte-se hoje ao SportBridge, gratuito para jogadores. Leva um minuto.', 'انضم إلى سبورت بريدج اليوم مجانًا للاعبين. يستغرق التسجيل دقيقة واحدة.', 'Únete hoy a SportBridge, gratis para jugadores. Solo toma un minuto.'],
  ['Join the conversation', 'Rejoignez la conversation', 'Participe na conversa', 'انضم إلى الحوار', 'Únete a la conversación'],
  ['Be the first to share something with the community.', 'Soyez le premier à partager avec la communauté.', 'Seja a primeira pessoa a partilhar algo com a comunidade.', 'كن أول من يشارك شيئًا مع المجتمع.', 'Sé el primero en compartir algo con la comunidad.'],
  ['Share updates, highlights, live sessions and opportunities with the community.', 'Partagez des actualités, des moments forts, des sessions en direct et des opportunités avec la communauté.', 'Partilhe atualizações, destaques, sessões ao vivo e oportunidades com a comunidade.', 'شارك التحديثات واللقطات والجلسات المباشرة والفرص مع المجتمع.', 'Comparte novedades, mejores momentos, sesiones en directo y oportunidades con la comunidad.'],
  ['Updates, highlights and opportunities from SportBridge.', 'Actualités, moments forts et opportunités de SportBridge.', 'Atualizações, destaques e oportunidades do SportBridge.', 'تحديثات ولقطات وفرص من سبورت بريدج.', 'Novedades, mejores momentos y oportunidades de SportBridge.'],
  ['Complete your profile to increase visibility to clubs and agents.', 'Complétez votre profil pour gagner en visibilité auprès des clubs et des agents.', 'Complete o seu perfil para aumentar a visibilidade junto de clubes e agentes.', 'أكمل ملفك الشخصي لزيادة ظهورك للأندية والوكلاء.', 'Completa tu perfil para aumentar tu visibilidad ante clubes y agentes.'],
  ['Search verified free players by position, age group, region and foot — find your next signing in seconds.', 'Recherchez des joueurs libres vérifiés par poste, âge, région et pied préféré. Trouvez votre prochain recrutement en quelques secondes.', 'Pesquise jogadores livres verificados por posição, idade, região e pé preferido. Encontre a próxima contratação em segundos.', 'ابحث عن لاعبين أحرار موثّقين حسب المركز والعمر والمنطقة والقدم المفضلة، واعثر على لاعبك التالي في ثوانٍ.', 'Busca jugadores libres verificados por posición, edad, región y pierna hábil. Encuentra tu próximo fichaje en segundos.'],
  ['Find tryouts by position, age group and region. All posts are reviewed. Free tryouts are marked clearly.', 'Trouvez des essais par poste, âge et région. Toutes les publications sont vérifiées. Les essais gratuits sont clairement indiqués.', 'Encontre testes por posição, idade e região. Todas as publicações são analisadas. Os testes gratuitos estão claramente identificados.', 'ابحث عن تجارب الأداء حسب المركز والفئة العمرية والمنطقة. تتم مراجعة جميع المنشورات وتُميّز التجارب المجانية بوضوح.', 'Encuentra pruebas por posición, grupo de edad y región. Revisamos todas las publicaciones y señalamos claramente las pruebas gratuitas.'],
  ['Player and staff openings, plus verified professionals seeking roles.', 'Offres pour joueurs et membres du personnel, ainsi que des professionnels vérifiés en recherche de poste.', 'Vagas para jogadores e equipa técnica, além de profissionais verificados à procura de oportunidades.', 'فرص للاعبين والموظفين، بالإضافة إلى مهنيين موثّقين يبحثون عن وظائف.', 'Vacantes para jugadores y personal, además de profesionales verificados que buscan empleo.'],
  ['Purpose-built tools for players, clubs, agents, scouts, coaches and sporting directors alike.', 'Des outils conçus pour les joueurs, clubs, agents, recruteurs, entraîneurs et directeurs sportifs.', 'Ferramentas feitas para jogadores, clubes, agentes, olheiros, treinadores e diretores desportivos.', 'أدوات مصممة للاعبين والأندية والوكلاء والكشافة والمدربين والمديرين الرياضيين.', 'Herramientas diseñadas para jugadores, clubes, agentes, ojeadores, entrenadores y directores deportivos.'],
  ['Never pay', 'Ne payez jamais', 'Nunca pague', 'لا تدفع أبدًا', 'Nunca pagues'],
  ['Never pay an agent or scout to arrange a trial or introduction.', 'Ne payez jamais un agent ou un recruteur pour organiser un essai ou une mise en relation.', 'Nunca pague a um agente ou olheiro para organizar um teste ou uma apresentação.', 'لا تدفع أبدًا لوكيل أو كشاف لترتيب تجربة أداء أو تقديمك إلى جهة.', 'Nunca pagues a un agente u ojeador por organizar una prueba o una presentación.'],
  ['Legitimate agents never charge players. Always check the Verified ✓ badge before engaging.', 'Les agents légitimes ne facturent jamais les joueurs. Vérifiez toujours le badge Vérifié ✓ avant tout échange.', 'Agentes legítimos nunca cobram aos jogadores. Verifique sempre o selo Verificado ✓ antes de interagir.', 'الوكلاء الموثوقون لا يفرضون رسومًا على اللاعبين. تحقق دائمًا من شارة موثّق ✓ قبل التعامل.', 'Los agentes legítimos nunca cobran a los jugadores. Comprueba siempre la insignia Verificado ✓ antes de contactar.'],
  ['All reports are reviewed by the SportBridge team within 48 hours.', 'L’équipe SportBridge examine tous les signalements sous 48 heures.', 'A equipa SportBridge analisa todas as denúncias em até 48 horas.', 'يراجع فريق سبورت بريدج جميع البلاغات خلال 48 ساعة.', 'El equipo de SportBridge revisa todas las denuncias en un plazo de 48 horas.'],
  ['Never share personal contact details publicly.', 'Ne partagez jamais vos coordonnées personnelles publiquement.', 'Nunca partilhe contactos pessoais publicamente.', 'لا تشارك بيانات الاتصال الشخصية علنًا.', 'Nunca compartas datos de contacto personales públicamente.'],
  ['Documents are stored securely and never shown publicly.', 'Les documents sont conservés en toute sécurité et ne sont jamais visibles publiquement.', 'Os documentos são armazenados em segurança e nunca são apresentados publicamente.', 'تُخزّن المستندات بأمان ولا تُعرض للعامة أبدًا.', 'Los documentos se almacenan de forma segura y nunca se muestran públicamente.'],
  ['Payment processing not yet implemented.', 'Le traitement des paiements n’est pas encore disponible.', 'O processamento de pagamentos ainda não está implementado.', 'لم تتم إضافة معالجة المدفوعات بعد.', 'El procesamiento de pagos aún no está implementado.'],
  ['Coming soon', 'Bientôt disponible', 'Em breve', 'قريبًا', 'Próximamente'],
  ['Coming Soon', 'Bientôt disponible', 'Em breve', 'قريبًا', 'Próximamente'],
  ['Account details', 'Informations du compte', 'Dados da conta', 'تفاصيل الحساب', 'Datos de la cuenta'],
  ['Account recovery', 'Récupération du compte', 'Recuperação da conta', 'استعادة الحساب', 'Recuperación de la cuenta'],
  ['Actions', 'Actions', 'Ações', 'الإجراءات', 'Acciones'],
  ['Admin note (optional)', 'Note administrateur (facultatif)', 'Nota do administrador (opcional)', 'ملاحظة المسؤول (اختيارية)', 'Nota del administrador (opcional)'],
  ['Applied', 'Candidature envoyée', 'Candidatou-se', 'تم التقديم', 'Solicitud enviada'],
  ['Applying…', 'Candidature en cours…', 'A candidatar-se…', 'جارٍ التقديم…', 'Enviando solicitud…'],
  ['Approve — Mark Verified', 'Approuver — marquer comme vérifié', 'Aprovar — marcar como verificado', 'موافقة — وضع علامة موثّق', 'Aprobar — marcar como verificado'],
  ['Approve ownership & publish', 'Approuver la propriété et publier', 'Aprovar a titularidade e publicar', 'الموافقة على الملكية والنشر', 'Aprobar la titularidad y publicar'],
  ['Are you a club or agent?', 'Êtes-vous un club ou un agent ?', 'É um clube ou agente?', 'هل أنت نادٍ أم وكيل؟', '¿Eres un club o un agente?'],
  ['Be specific. Include dates, amounts, messages if relevant.', 'Soyez précis. Indiquez les dates, montants et messages pertinents.', 'Seja específico. Inclua datas, valores e mensagens relevantes.', 'كن دقيقًا. أدرج التواريخ والمبالغ والرسائل عند الاقتضاء.', 'Sé específico. Incluye fechas, cantidades y mensajes relevantes.'],
  ['CAC / company registration document (PDF)', 'Document CAC / immatriculation de la société (PDF)', 'Documento CAC / registo da empresa (PDF)', 'مستند CAC / تسجيل الشركة (PDF)', 'Documento CAC / registro de empresa (PDF)'],
  ['CAC document and contracts are stored privately and never shown publicly.', 'Le document CAC et les contrats sont conservés de manière privée et ne sont jamais visibles publiquement.', 'O documento CAC e os contratos são guardados em privado e nunca são apresentados publicamente.', 'يُحفظ مستند CAC والعقود بشكل خاص ولا تُعرض للعامة أبدًا.', 'El documento CAC y los contratos se guardan de forma privada y nunca se muestran públicamente.'],
  ['Can’t find it? Check your spam / junk folder.', 'Vous ne le trouvez pas ? Vérifiez vos courriers indésirables.', 'Não encontra? Verifique a pasta de spam ou lixo eletrónico.', 'لم تجده؟ تحقق من مجلد الرسائل غير المرغوب فيها.', '¿No lo encuentras? Revisa la carpeta de spam o correo no deseado.'],
  ['Check your inbox', 'Vérifiez votre boîte de réception', 'Verifique a sua caixa de entrada', 'تحقق من صندوق الوارد', 'Revisa tu bandeja de entrada'],
  ['Check your inbox for a password reset link. It expires in 1 hour.', 'Consultez votre boîte de réception pour le lien de réinitialisation. Il expire dans une heure.', 'Procure na caixa de entrada o link de reposição da palavra-passe. Expira em 1 hora.', 'تحقق من صندوق الوارد لرابط إعادة تعيين كلمة المرور. تنتهي صلاحيته خلال ساعة.', 'Busca en tu bandeja de entrada el enlace para restablecer la contraseña. Caduca en 1 hora.'],
  ['Club CV / presentation', 'CV / présentation du club', 'CV / apresentação do clube', 'السيرة الذاتية / نبذة تعريفية عن النادي', 'CV / presentación del club'],
  ['Company registration number', 'Numéro d’immatriculation de la société', 'Número de registo da empresa', 'رقم تسجيل الشركة', 'Número de registro de la empresa'],
  ['Complete club verification before adding players to the roster.', 'Vérifiez le club avant d’ajouter des joueurs à l’effectif.', 'Verifique o clube antes de adicionar jogadores ao plantel.', 'أكمل توثيق النادي قبل إضافة اللاعبين إلى القائمة.', 'Verifica el club antes de añadir jugadores a la plantilla.'],
  ['Complete verification before publishing tryouts or player-search opportunities.', 'Effectuez la vérification avant de publier des essais ou des recherches de joueurs.', 'Conclua a verificação antes de publicar testes ou oportunidades para jogadores.', 'أكمل التحقق قبل نشر تجارب الأداء أو فرص البحث عن لاعبين.', 'Completa la verificación antes de publicar pruebas u oportunidades para jugadores.'],
  ['Contact player', 'Contacter le joueur', 'Contactar jogador', 'التواصل مع اللاعب', 'Contactar con el jugador'],
  ['Contact unlock required', 'Déverrouillage du contact requis', 'É necessário desbloquear o contacto', 'يلزم فتح بيانات الاتصال', 'Se requiere desbloquear el contacto'],
  ['Contact unlocked — send a message via inbox.', 'Contact déverrouillé — envoyez un message dans la boîte de réception.', 'Contacto desbloqueado — envie uma mensagem pela caixa de entrada.', 'تم فتح بيانات الاتصال — أرسل رسالة عبر الوارد.', 'Contacto desbloqueado — envía un mensaje por la bandeja de entrada.'],
  ['Create a free account', 'Créer un compte gratuit', 'Criar uma conta gratuita', 'أنشئ حسابًا مجانيًا', 'Crear una cuenta gratis'],
  ['Create a free account to access player CVs.', 'Créez un compte gratuit pour consulter les CV des joueurs.', 'Crie uma conta gratuita para aceder aos currículos dos jogadores.', 'أنشئ حسابًا مجانيًا للوصول إلى السير الذاتية للاعبين.', 'Crea una cuenta gratis para acceder a los CV de los jugadores.'],
  ['Create Player Profile', 'Créer un profil de joueur', 'Criar perfil de jogador', 'إنشاء ملف لاعب', 'Crear perfil de jugador'],
  ['Create your free account', 'Créez votre compte gratuit', 'Crie a sua conta gratuita', 'أنشئ حسابك المجاني', 'Crea tu cuenta gratis'],
  ['Date & time', 'Date et heure', 'Data e hora', 'التاريخ والوقت', 'Fecha y hora'],
  ['Describe what happened', 'Décrivez les faits', 'Descreva o que aconteceu', 'صف ما حدث', 'Describe lo ocurrido'],
  ['Documents / Certificates (PDF · max 2 MB each · up to 5)', 'Documents / certificats (PDF · 2 Mo maximum chacun · jusqu’à 5)', 'Documentos / certificados (PDF · máx. 2 MB cada · até 5)', 'المستندات / الشهادات (PDF · حد أقصى 2 ميغابايت لكل ملف · حتى 5 ملفات)', 'Documentos / certificados (PDF · máx. 2 MB cada uno · hasta 5)'],
  ['Download CV (PDF)', 'Télécharger le CV (PDF)', 'Descarregar currículo (PDF)', 'تنزيل السيرة الذاتية (PDF)', 'Descargar CV (PDF)'],
  ['Email address', 'Adresse e-mail', 'Endereço de e-mail', 'عنوان البريد الإلكتروني', 'Dirección de correo electrónico'],
  ['FA / Federation verification letter', 'Lettre de vérification de la fédération', 'Carta de verificação da federação', 'خطاب تحقق من الاتحاد', 'Carta de verificación de la federación'],
  ['Facility pictures', 'Photos des installations', 'Fotografias das instalações', 'صور المرافق', 'Fotos de las instalaciones'],
  ['Featured', 'À la une', 'Em destaque', 'مميّز', 'Destacado'],
  ['File a Report', 'Signaler un problème', 'Fazer uma denúncia', 'الإبلاغ عن مشكلة', 'Presentar una denuncia'],
  ['Find tryouts by position, age group and region. All posts are reviewed. Free tryouts are marked clearly.', 'Trouvez des essais par poste, âge et région. Toutes les publications sont vérifiées. Les essais gratuits sont clairement indiqués.', 'Encontre testes por posição, idade e região. Todas as publicações são analisadas. Os testes gratuitos estão claramente identificados.', 'ابحث عن تجارب الأداء حسب المركز والفئة العمرية والمنطقة. تتم مراجعة جميع المنشورات وتُميّز التجارب المجانية بوضوح.', 'Encuentra pruebas por posición, grupo de edad y región. Revisamos todas las publicaciones y señalamos claramente las pruebas gratuitas.'],
  ['Forgot password?', 'Mot de passe oublié ?', 'Esqueceu-se da palavra-passe?', 'هل نسيت كلمة المرور؟', '¿Olvidaste tu contraseña?'],
  ['Free agents only', 'Joueurs libres uniquement', 'Apenas jogadores livres', 'اللاعبون الأحرار فقط', 'Solo jugadores libres'],
  ['Get verified', 'Faites-vous vérifier', 'Verifique a sua conta', 'أكمل التوثيق', 'Verifica tu cuenta'],
  ['Get your Verified ✓ badge', 'Obtenez votre badge Vérifié ✓', 'Obtenha o selo Verificado ✓', 'احصل على شارة موثّق ✓', 'Obtén tu insignia Verificado ✓'],
  ['Join SportBridge', 'Rejoindre SportBridge', 'Junte-se ao SportBridge', 'انضم إلى سبورت بريدج', 'Únete a SportBridge'],
  ['Login required to view documents', 'Connectez-vous pour consulter les documents', 'Inicie sessão para ver os documentos', 'سجّل الدخول لعرض المستندات', 'Inicia sesión para ver los documentos'],
  ['Login to contact', 'Connectez-vous pour contacter', 'Inicie sessão para contactar', 'سجّل الدخول للتواصل', 'Inicia sesión para contactar'],
  ['Make your move', 'Passez à l’action', 'Dê o próximo passo', 'اتخذ خطوتك التالية', 'Da el siguiente paso'],
  ['No jobs match your filters', 'Aucune offre ne correspond à vos filtres', 'Nenhuma vaga corresponde aos filtros', 'لا توجد وظائف تطابق عوامل التصفية', 'Ningún empleo coincide con los filtros'],
  ['No players match your filters', 'Aucun joueur ne correspond à vos filtres', 'Nenhum jogador corresponde aos filtros', 'لا يوجد لاعبون يطابقون عوامل التصفية', 'Ningún jugador coincide con los filtros'],
  ['No tryouts match your filters', 'Aucun essai ne correspond à vos filtres', 'Nenhum teste corresponde aos filtros', 'لا توجد تجارب أداء تطابق عوامل التصفية', 'Ninguna prueba coincide con los filtros'],
  ['No users on this page match your search.', 'Aucun utilisateur de cette page ne correspond à votre recherche.', 'Nenhum utilizador desta página corresponde à pesquisa.', 'لا يوجد مستخدمون في هذه الصفحة يطابقون بحثك.', 'Ningún usuario de esta página coincide con tu búsqueda.'],
  ['Open to work', 'À la recherche d’un poste', 'Disponível para trabalhar', 'متاح للعمل', 'Disponible para trabajar'],
  ['Our team is reviewing your documents. You’ll be notified within 48 hours.', 'Notre équipe examine vos documents. Vous recevrez une notification sous 48 heures.', 'A nossa equipa está a analisar os seus documentos. Receberá uma notificação em até 48 horas.', 'يراجع فريقنا مستنداتك. سيتم إشعارك خلال 48 ساعة.', 'Nuestro equipo está revisando tus documentos. Recibirás una notificación en un plazo de 48 horas.'],
  ['Paid tryouts go to admin review first', 'Les essais payants sont d’abord soumis à l’administration', 'Os testes pagos são enviados primeiro para análise administrativa', 'تُرسل تجارب الأداء المدفوعة إلى الإدارة للمراجعة أولًا', 'Las pruebas de pago se envían primero a revisión administrativa'],
  ['Password', 'Mot de passe', 'Palavra-passe', 'كلمة المرور', 'Contraseña'],
  ['Phone numbers and email addresses are automatically blocked. Use the secure inbox to share contact details.', 'Les numéros de téléphone et les adresses e-mail sont automatiquement bloqués. Utilisez la messagerie sécurisée pour partager vos coordonnées.', 'Os números de telefone e endereços de e-mail são bloqueados automaticamente. Use a caixa de entrada segura para partilhar contactos.', 'يتم حظر أرقام الهواتف وعناوين البريد الإلكتروني تلقائيًا. استخدم صندوق الوارد الآمن لمشاركة بيانات الاتصال.', 'Los teléfonos y correos electrónicos se bloquean automáticamente. Usa la bandeja segura para compartir datos de contacto.'],
  ['Phone numbers and emails are never shown publicly.', 'Les numéros de téléphone et les e-mails ne sont jamais affichés publiquement.', 'Os números de telefone e e-mails nunca são apresentados publicamente.', 'لا تُعرض أرقام الهواتف أو عناوين البريد الإلكتروني للعامة أبدًا.', 'Los teléfonos y correos electrónicos nunca se muestran públicamente.'],
  ['Player Directory', 'Annuaire des joueurs', 'Diretório de jogadores', 'دليل اللاعبين', 'Directorio de jugadores'],
  ['Player Needed', 'Joueur recherché', 'Jogador pretendido', 'مطلوب لاعب', 'Se busca jugador'],
  ['Player profiles', 'Profils des joueurs', 'Perfis de jogadores', 'ملفات اللاعبين', 'Perfiles de jugadores'],
  ['Post job', 'Publier une offre', 'Publicar vaga', 'نشر وظيفة', 'Publicar empleo'],
  ['Post tryout', 'Publier un essai', 'Publicar teste', 'نشر تجربة أداء', 'Publicar prueba'],
  ['Profile completeness', 'Complétude du profil', 'Completude do perfil', 'اكتمال الملف الشخصي', 'Perfil completado'],
  ['Public profile', 'Profil public', 'Perfil público', 'الملف الشخصي العام', 'Perfil público'],
  ['Quick links', 'Liens rapides', 'Ligações rápidas', 'روابط سريعة', 'Enlaces rápidos'],
  ['Reason for report', 'Motif du signalement', 'Motivo da denúncia', 'سبب البلاغ', 'Motivo de la denuncia'],
  ['Report this profile', 'Signaler ce profil', 'Denunciar este perfil', 'الإبلاغ عن هذا الملف الشخصي', 'Denunciar este perfil'],
  ['Reset your password', 'Réinitialiser votre mot de passe', 'Redefinir a palavra-passe', 'إعادة تعيين كلمة المرور', 'Restablecer tu contraseña'],
  ['Reset link sent', 'Lien de réinitialisation envoyé', 'Link de reposição enviado', 'تم إرسال رابط إعادة التعيين', 'Enlace de restablecimiento enviado'],
  ['Safety Notice', 'Avis de sécurité', 'Aviso de segurança', 'تنبيه أمني', 'Aviso de seguridad'],
  ['Save profile', 'Enregistrer le profil', 'Guardar perfil', 'حفظ الملف الشخصي', 'Guardar perfil'],
  ['Search jobs…', 'Rechercher des offres…', 'Pesquisar vagas…', 'ابحث عن وظائف…', 'Buscar empleos…'],
  ['Search players…', 'Rechercher des joueurs…', 'Pesquisar jogadores…', 'ابحث عن لاعبين…', 'Buscar jugadores…'],
  ['Search tryouts…', 'Rechercher des essais…', 'Pesquisar testes…', 'ابحث عن تجارب أداء…', 'Buscar pruebas…'],
  ['The World\'s #1 Verified Football Network', 'Le réseau de football vérifié n° 1 au monde', 'A rede de futebol verificada nº 1 do mundo', 'شبكة كرة القدم الموثّقة الأولى في العالم', 'La red de fútbol verificada n.º 1 del mundo'],
  ['Stop Chasing Fake Agents.', 'Ne courez plus après les faux agents.', 'Pare de correr atrás de agentes falsos.', 'توقف عن ملاحقة الوكلاء المزيفين.', 'Deja de perseguir a agentes falsos.'],
  ['Get Verified.', 'Faites-vous vérifier.', 'Obtenha verificação.', 'احصل على التوثيق.', 'Verifícate.'],
  ['SportBridge connects', 'SportBridge met en relation', 'O SportBridge liga', 'يربط SportBridge بين', 'SportBridge conecta'],
  ['with', 'avec', 'com', 'مع', 'con'],
  ['in Africa and across The World.', 'en Afrique et dans le monde entier.', 'em África e em todo o mundo.', 'في أفريقيا وحول العالم.', 'en África y en todo el mundo.'],
  ['Full CV + Full-Match Video + highlights + Stats + Secure Unlock', 'CV complet + vidéo intégrale du match + moments forts + statistiques + accès sécurisé', 'CV completo + vídeo integral do jogo + destaques + estatísticas + acesso seguro', 'سيرة ذاتية كاملة + فيديو المباراة كاملة + أبرز اللقطات + الإحصائيات + فتح آمن', 'CV completo + vídeo del partido completo + mejores momentos + estadísticas + acceso seguro'],
  ['not just highlights.', 'pas seulement des moments forts.', 'não apenas destaques.', 'وليس مجرد لقطات بارزة.', 'no solo mejores momentos.'],
  ['Social Media', 'Réseaux sociaux', 'Redes sociais', 'وسائل التواصل الاجتماعي', 'Redes sociales'],
  ['Edited highlights only', 'Uniquement des moments forts montés', 'Apenas destaques editados', 'لقطات بارزة معدّلة فقط', 'Solo mejores momentos editados'],
  ['Verified CV + Full Match Video + Availability', 'CV vérifié + vidéo intégrale du match + disponibilité', 'CV verificado + vídeo integral do jogo + disponibilidade', 'سيرة ذاتية موثّقة + فيديو المباراة كاملة + التوفر', 'CV verificado + vídeo del partido completo + disponibilidad'],
  ['Job sites', 'Sites d’emploi', 'Sites de emprego', 'مواقع الوظائف', 'Portales de empleo'],
  ['Corporate jobs only', 'Emplois de bureau uniquement', 'Apenas empregos empresariais', 'وظائف الشركات فقط', 'Solo empleos corporativos'],
  ['Groups', 'Groupes', 'Grupos', 'مجموعات', 'Grupos'],
  ['Scams & phone number leaks', 'Arnaques et divulgation de numéros de téléphone', 'Fraudes e divulgação de números de telefone', 'عمليات احتيال وتسريب أرقام الهواتف', 'Estafas y filtraciones de números de teléfono'],
  ['Social Media: Edited highlights only', 'Réseaux sociaux : uniquement des moments forts montés', 'Redes sociais: apenas destaques editados', 'وسائل التواصل الاجتماعي: لقطات بارزة معدّلة فقط', 'Redes sociales: solo mejores momentos editados'],
  ['SportBridge: Verified CV + Full Match Video + Availability', 'SportBridge : CV vérifié + vidéo intégrale du match + disponibilité', 'SportBridge: CV verificado + vídeo integral do jogo + disponibilidade', 'SportBridge: سيرة ذاتية موثّقة + فيديو المباراة كاملة + التوفر', 'SportBridge: CV verificado + vídeo del partido completo + disponibilidad'],
  ['Job sites: Corporate jobs only', 'Sites d’emploi : emplois de bureau uniquement', 'Sites de emprego: apenas empregos empresariais', 'مواقع الوظائف: وظائف الشركات فقط', 'Portales de empleo: solo empleos corporativos'],
  ['SportBridge: Football jobs by position · age group · region', 'SportBridge : emplois dans le football par poste · âge · région', 'SportBridge: vagas no futebol por posição · idade · região', 'SportBridge: وظائف كرة القدم حسب المركز · الفئة العمرية · المنطقة', 'SportBridge: empleos de fútbol por posición · edad · región'],
  ['Groups: Scams & phone number leaks', 'Groupes : arnaques et divulgation de numéros de téléphone', 'Grupos: fraudes e divulgação de números de telefone', 'المجموعات: عمليات احتيال وتسريب أرقام الهواتف', 'Grupos: estafas y filtraciones de números de teléfono'],
  ['SportBridge: NIN verified · video hash · no leaked contacts', 'SportBridge : NIN vérifié · empreinte vidéo · aucun contact divulgué', 'SportBridge: NIN verificado · hash do vídeo · sem contactos divulgados', 'SportBridge: رقم NIN موثّق · بصمة الفيديو · دون تسريب بيانات الاتصال', 'SportBridge: NIN verificado · hash de vídeo · sin filtración de contactos'],
  ['Fake agents collecting fees', 'Faux agents qui perçoivent des frais', 'Agentes falsos que cobram taxas', 'وكلاء مزيفون يطلبون رسومًا', 'Agentes falsos que cobran comisiones'],
  ['Verified Agent badge + fee warning on every post', 'Badge Agent vérifié et avertissement sur les frais dans chaque annonce', 'Selo de agente verificado e aviso de taxa em cada publicação', 'شارة وكيل موثّق وتحذير من الرسوم في كل منشور', 'Insignia de agente verificado y aviso de tarifas en cada publicación'],
  ['Edited highlight clips', 'Extraits vidéo montés', 'Vídeos de melhores momentos editados', 'مقاطع لقطات بارزة معدّلة', 'Clips de mejores momentos editados'],
  ['Full-match video required + SHA-256 duplicate detector', 'Vidéo intégrale du match obligatoire + détection des doublons SHA-256', 'Vídeo integral do jogo obrigatório + deteção de duplicados SHA-256', 'فيديو المباراة الكامل مطلوب + كشف الملفات المكررة ببصمة SHA-256', 'Vídeo del partido completo obligatorio + detector de duplicados SHA-256'],
  ['Phone numbers scraped from WhatsApp', 'Numéros de téléphone récupérés sur WhatsApp', 'Números de telefone recolhidos no WhatsApp', 'استخراج أرقام الهواتف من واتساب', 'Números de teléfono extraídos de WhatsApp'],
  ['Contact unlock only after identity verification', 'Déverrouillage du contact après vérification de l’identité uniquement', 'Acesso ao contacto apenas após verificação de identidade', 'لا يُتاح الوصول إلى جهة الاتصال إلا بعد التحقق من الهوية', 'El contacto solo se desbloquea tras verificar la identidad'],
  ['Never pay an agent to be selected or for a guaranteed opportunity. Report suspicious fee requests.', 'Ne payez jamais un agent pour être sélectionné ou pour obtenir une opportunité garantie. Signalez toute demande de frais suspecte.', 'Nunca pague a um agente para ser selecionado ou por uma oportunidade garantida. Denuncie pedidos de pagamento suspeitos.', 'لا تدفع أبدًا لوكيل مقابل اختيارك أو ضمان فرصة. أبلغ عن طلبات الرسوم المشبوهة.', 'Nunca pagues a un agente para que te seleccione ni por una oportunidad garantizada. Denuncia las solicitudes de pago sospechosas.'],
  ['Opportunities', 'Opportunités', 'Oportunidades', 'الفرص', 'Oportunidades'],
  ['Football Job Board', 'Tableau des offres d’emploi dans le football', 'Quadro de vagas de futebol', 'لوحة وظائف كرة القدم', 'Tablón de empleos de fútbol'],
  ['Player profiles', 'Profils de joueurs', 'Perfis de jogadores', 'ملفات اللاعبين', 'Perfiles de jugadores'],
  ['Countries reached', 'Pays couverts', 'Países alcançados', 'البلدان التي وصلنا إليها', 'Países alcanzados'],
  ['For Players', 'Pour les joueurs', 'Para jogadores', 'للاعبين', 'Para jugadores'],
  ['For Clubs & Academies', 'Pour les clubs et académies', 'Para clubes e academias', 'للأندية والأكاديميات', 'Para clubes y academias'],
  ['For Agents & Scouts', 'Pour les agents et recruteurs', 'Para agentes e olheiros', 'للوكلاء والكشافة', 'Para agentes y ojeadores'],
  ['For Coaches & Sporting Directors', 'Pour les entraîneurs et directeurs sportifs', 'Para treinadores e diretores desportivos', 'للمدربين والمديرين الرياضيين', 'Para entrenadores y directores deportivos'],
  ['Free profile. Get discovered.', 'Profil gratuit. Faites-vous repérer.', 'Perfil gratuito. Dê-se a conhecer.', 'ملف مجاني. كن معروفًا.', 'Perfil gratis. Date a conocer.'],
  ['Showcase your squad to the world.', 'Présentez votre équipe au monde entier.', 'Apresente a sua equipa ao mundo.', 'اعرض فريقك للعالم.', 'Presenta tu equipo al mundo.'],
  ['Scout the next generation.', 'Repérez la prochaine génération.', 'Descubra a próxima geração.', 'اكتشف الجيل القادم.', 'Descubre a la próxima generación.'],
  ['Land your next role.', 'Trouvez votre prochain poste.', 'Encontre a sua próxima função.', 'اعثر على وظيفتك القادمة.', 'Consigue tu próximo puesto.'],
  ['Create a free profile with photos, full-match videos and your CV. Go public and get discovered by verified clubs, academies and agents — no middleman required.', 'Créez un profil gratuit avec des photos, des vidéos de matchs complets et votre CV. Rendez-le public pour être repéré par des clubs, académies et agents vérifiés, sans intermédiaire.', 'Crie um perfil gratuito com fotografias, vídeos de jogos completos e o seu CV. Torne-o público para ser descoberto por clubes, academias e agentes verificados, sem intermediários.', 'أنشئ ملفًا مجانيًا بالصور وفيديوهات المباريات كاملة وسيرتك الذاتية. اجعله عامًا لتكتشفك الأندية والأكاديميات والوكلاء الموثّقون، دون وسيط.', 'Crea un perfil gratis con fotos, vídeos de partidos completos y tu CV. Hazlo público para que te descubran clubes, academias y agentes verificados, sin intermediarios.'],
  ['Create players, build your squad roster, post Player Needed & Staff Needed jobs, and showcase your verified club to scouts and agents worldwide.', 'Ajoutez des joueurs, créez votre effectif, publiez des offres pour joueurs et personnel, et présentez votre club vérifié aux recruteurs et agents du monde entier.', 'Adicione jogadores, crie o plantel, publique vagas para jogadores e equipa técnica e apresente o seu clube verificado a olheiros e agentes de todo o mundo.', 'أضف اللاعبين، وأنشئ قائمة فريقك، وانشر وظائف للاعبين والموظفين، واعرض ناديك الموثّق على الكشافة والوكلاء حول العالم.', 'Añade jugadores, crea tu plantilla, publica vacantes para jugadores y personal, y presenta tu club verificado a ojeadores y agentes de todo el mundo.'],
  ['Search verified players by position, age and region. Build a watchlist, post Player Positions Needed on behalf of clubs, and run verified tryout opportunities.', 'Recherchez des joueurs vérifiés par poste, âge et région. Créez une liste de suivi, publiez les postes recherchés pour les clubs et organisez des essais vérifiés.', 'Pesquise jogadores verificados por posição, idade e região. Crie uma lista de observação, publique posições procuradas em nome dos clubes e organize testes verificados.', 'ابحث عن لاعبين موثّقين حسب المركز والعمر والمنطقة. أنشئ قائمة متابعة، وانشر احتياجات الأندية من اللاعبين، ونظّم تجارب أداء موثّقة.', 'Busca jugadores verificados por posición, edad y región. Crea una lista de seguimiento, publica vacantes para clubes y organiza pruebas verificadas.'],
  ['Browse coaching and management roles, apply with your verified profile, and recommend talented players directly to agents and clubs from your dashboard.', 'Consultez les postes d’entraîneur et de direction, postulez avec votre profil vérifié et recommandez des joueurs talentueux aux agents et aux clubs depuis votre tableau de bord.', 'Explore funções de treinador e gestão, candidate-se com o seu perfil verificado e recomende jogadores talentosos diretamente a agentes e clubes no seu painel.', 'تصفّح وظائف التدريب والإدارة، وقدّم طلبك بملفك الموثّق، وأوصِ باللاعبين الموهوبين مباشرةً للوكلاء والأندية من لوحة التحكم.', 'Explora puestos de entrenador y gestión, solicita empleo con tu perfil verificado y recomienda jugadores con talento a agentes y clubes desde tu panel.'],
  ['Create your player profile', 'Créer votre profil de joueur', 'Crie o seu perfil de jogador', 'أنشئ ملف اللاعب الخاص بك', 'Crea tu perfil de jugador'],
  ['Register your club / academy', 'Inscrire votre club / académie', 'Registe o seu clube / academia', 'سجّل ناديك / أكاديميتك', 'Registra tu club / academia'],
  ['Register as an agent / scout', 'S’inscrire comme agent / recruteur', 'Registe-se como agente / olheiro', 'سجّل كوكيل / كشاف', 'Regístrate como agente / ojeador'],
  ['Register as a coach / manager', 'S’inscrire comme entraîneur / manager', 'Registe-se como treinador / gestor', 'سجّل كمدرب / مدير', 'Regístrate como entrenador / director'],
  ['Built for the game', 'Conçu pour le sport', 'Feito para o desporto', 'مصمم للعبة', 'Hecho para el deporte'],
  ['Find your next stage', 'Trouvez votre prochaine étape', 'Encontre a sua próxima oportunidade', 'اعثر على خطوتك التالية', 'Encuentra tu próxima oportunidad'],
  ['Make your move', 'Passez à l’action', 'Dê o próximo passo', 'اتخذ خطوتك', 'Da el siguiente paso'],
  ['Ready to make your next move?', 'Prêt à passer à la prochaine étape ?', 'Pronto para dar o próximo passo?', 'هل أنت مستعد لخطوتك التالية؟', '¿Listo para dar el siguiente paso?'],
  ['Create your free account', 'Créer votre compte gratuit', 'Crie a sua conta gratuita', 'أنشئ حسابك المجاني', 'Crea tu cuenta gratis'],
  ['Scout the next generation', 'Repérez la prochaine génération', 'Descubra a próxima geração', 'اكتشف الجيل القادم', 'Descubre a la próxima generación'],
  ['Select a conversation', 'Sélectionner une conversation', 'Selecionar uma conversa', 'اختر محادثة', 'Seleccionar una conversación'],
  ['Select a conversation to read messages', 'Sélectionnez une conversation pour lire les messages', 'Selecione uma conversa para ler as mensagens', 'اختر محادثة لقراءة الرسائل', 'Selecciona una conversación para leer los mensajes'],
  ['Sign in to comment.', 'Connectez-vous pour commenter.', 'Inicie sessão para comentar.', 'سجّل الدخول للتعليق.', 'Inicia sesión para comentar.'],
  ['Sign in to like or comment', 'Connectez-vous pour aimer ou commenter', 'Inicie sessão para gostar ou comentar', 'سجّل الدخول للإعجاب أو التعليق', 'Inicia sesión para indicar que te gusta o comentar'],
  ['Sign in to view and send messages to clubs, agents, and players.', 'Connectez-vous pour consulter et envoyer des messages aux clubs, agents et joueurs.', 'Inicie sessão para ver e enviar mensagens a clubes, agentes e jogadores.', 'سجّل الدخول لعرض الرسائل وإرسالها إلى الأندية والوكلاء واللاعبين.', 'Inicia sesión para ver y enviar mensajes a clubes, agentes y jugadores.'],
  ['Sign in to file a dispute.', 'Connectez-vous pour déposer un litige.', 'Inicie sessão para apresentar uma contestação.', 'سجّل الدخول لتقديم اعتراض.', 'Inicia sesión para presentar una disputa.'],
  ['Sign in to SportBridge', 'Se connecter à SportBridge', 'Iniciar sessão no SportBridge', 'تسجيل الدخول إلى سبورت بريدج', 'Iniciar sesión en SportBridge'],
  ['SportBridge account', 'Compte SportBridge', 'Conta SportBridge', 'حساب سبورت بريدج', 'Cuenta de SportBridge'],
  ['SportBridge Premium Plans', 'Offres SportBridge Premium', 'Planos SportBridge Premium', 'باقات سبورت بريدج المميزة', 'Planes Premium de SportBridge'],
  ['Submit Report', 'Envoyer le signalement', 'Enviar denúncia', 'إرسال البلاغ', 'Enviar denuncia'],
  ['Supabase is not configured — player search is unavailable.', 'Supabase n’est pas configuré — la recherche de joueurs est indisponible.', 'O Supabase não está configurado — a pesquisa de jogadores está indisponível.', 'لم يتم إعداد Supabase — البحث عن اللاعبين غير متاح.', 'Supabase no está configurado: la búsqueda de jugadores no está disponible.'],
  ['Supabase is not configured. File upload is unavailable.', 'Supabase n’est pas configuré. Le téléversement de fichiers est indisponible.', 'O Supabase não está configurado. O carregamento de ficheiros está indisponível.', 'لم يتم إعداد Supabase. رفع الملفات غير متاح.', 'Supabase no está configurado. La carga de archivos no está disponible.'],
  ['Supabase is not configured. Job posting is unavailable.', 'Supabase n’est pas configuré. La publication d’offres est indisponible.', 'O Supabase não está configurado. A publicação de vagas está indisponível.', 'لم يتم إعداد Supabase. نشر الوظائف غير متاح.', 'Supabase no está configurado. La publicación de empleos no está disponible.'],
  ['Supabase is not configured. Tryout posting is unavailable.', 'Supabase n’est pas configuré. La publication d’essais est indisponible.', 'O Supabase não está configurado. A publicação de testes está indisponível.', 'لم يتم إعداد Supabase. نشر تجارب الأداء غير متاح.', 'Supabase no está configurado. La publicación de pruebas no está disponible.'],
  ['Try adjusting position, region or removing the verified-only filter.', 'Essayez de modifier le poste ou la région, ou de désactiver le filtre « Vérifiés uniquement ».', 'Experimente alterar a posição ou região, ou desativar o filtro de verificados.', 'جرّب تغيير المركز أو المنطقة أو إزالة عامل تصفية الموثّقين فقط.', 'Prueba a cambiar la posición o región, o quitar el filtro de verificados.'],
  ['Try adjusting the position, region, or turning off “Verified Only”.', 'Essayez de modifier le poste ou la région, ou de désactiver « Vérifiés uniquement ».', 'Experimente alterar a posição ou região, ou desativar « Apenas verificados».', 'جرّب تغيير المركز أو المنطقة أو إيقاف «الموثّقون فقط».', 'Prueba a cambiar la posición o región, o desactivar «Solo verificados».'],
  ['Tryout Opportunities', 'Opportunités d’essai', 'Oportunidades de teste', 'فرص تجارب الأداء', 'Oportunidades de prueba'],
  ['Unknown role', 'Rôle inconnu', 'Função desconhecida', 'دور غير معروف', 'Rol desconocido'],
  ['User accounts', 'Comptes utilisateurs', 'Contas de utilizadores', 'حسابات المستخدمين', 'Cuentas de usuario'],
  ['Verification', 'Vérification', 'Verificação', 'التحقق', 'Verificación'],
  ['Verification in review', 'Vérification en cours d’examen', 'Verificação em análise', 'التحقق قيد المراجعة', 'Verificación en revisión'],
  ['Verified Clubs, Academies, Agents & Scouts', 'Clubs, académies, agents et recruteurs vérifiés', 'Clubes, academias, agentes e olheiros verificados', 'أندية وأكاديميات ووكلاء وكشافة موثّقون', 'Clubes, academias, agentes y ojeadores verificados'],
  ['Verify club', 'Vérifier le club', 'Verificar clube', 'توثيق النادي', 'Verificar club'],
  ['Verify your account before posting job openings or job-seeker availability.', 'Vérifiez votre compte avant de publier des offres ou votre disponibilité professionnelle.', 'Verifique a sua conta antes de publicar vagas ou indicar que procura trabalho.', 'تحقق من حسابك قبل نشر الوظائف أو إعلان تفرغك للعمل.', 'Verifica tu cuenta antes de publicar ofertas o indicar que buscas empleo.'],
  ['Add a player to your roster', 'Ajouter un joueur à votre effectif', 'Adicionar jogador ao plantel', 'أضف لاعبًا إلى قائمتك', 'Añadir un jugador a tu plantilla'],
  ['Agency profile', 'Profil de l’agence', 'Perfil da agência', 'ملف الوكالة', 'Perfil de la agencia'],
  ['Club / academy profile', 'Profil du club / de l’académie', 'Perfil do clube / academia', 'ملف النادي / الأكاديمية', 'Perfil del club / academia'],
  ['Coaching profile', 'Profil d’entraîneur', 'Perfil de treinador', 'ملف المدرب', 'Perfil de entrenador'],
  ['Filter this page by name, email or role…', 'Filtrer cette page par nom, e-mail ou rôle…', 'Filtrar esta página por nome, e-mail ou função…', 'صفّ هذه الصفحة حسب الاسم أو البريد أو الدور…', 'Filtra esta página por nombre, correo o función…'],
  ['Name shown on your profile', 'Nom affiché sur votre profil', 'Nome apresentado no seu perfil', 'الاسم الظاهر في ملفك الشخصي', 'Nombre que aparece en tu perfil'],
  ['Player profile', 'Profil du joueur', 'Perfil do jogador', 'ملف اللاعب', 'Perfil del jugador'],
  ['Post a Job', 'Publier une offre', 'Publicar vaga', 'نشر وظيفة', 'Publicar un empleo'],
  ['Post a Tryout Opportunity', 'Publier une opportunité d’essai', 'Publicar oportunidade de teste', 'نشر فرصة تجربة أداء', 'Publicar una oportunidad de prueba'],
  ['Post Player Position Needed', 'Publier un poste recherché', 'Publicar posição de jogador pretendida', 'نشر مركز لاعب مطلوب', 'Publicar una posición de jugador necesaria'],
  ['Recommend a Player', 'Recommander un joueur', 'Recomendar jogador', 'التوصية بلاعب', 'Recomendar a un jugador'],
  ['Write a message…', 'Écrire un message…', 'Escrever uma mensagem…', 'اكتب رسالة…', 'Escribe un mensaje…'],
  ['Write a comment…', 'Écrire un commentaire…', 'Escrever um comentário…', 'اكتب تعليقًا…', 'Escribe un comentario…'],
  ['Why are you recommending this player? What makes them special?', 'Pourquoi recommandez-vous ce joueur ? Qu’est-ce qui le distingue ?', 'Porque recomenda este jogador? O que o torna especial?', 'لماذا توصي بهذا اللاعب؟ ما الذي يميّزه؟', '¿Por qué recomiendas a este jugador? ¿Qué lo hace especial?'],
  ['Reason for approval or rejection…', 'Motif de l’approbation ou du rejet…', 'Motivo da aprovação ou rejeição…', 'سبب الموافقة أو الرفض…', 'Motivo de aprobación o rechazo…'],
  ['Provide as much detail as possible. What happened? When? Do not include phone numbers or email addresses.', 'Fournissez autant de détails que possible. Que s’est-il passé et quand ? N’indiquez aucun numéro de téléphone ni adresse e-mail.', 'Forneça o máximo de detalhes possível. O que aconteceu e quando? Não inclua números de telefone nem endereços de e-mail.', 'قدّم أكبر قدر ممكن من التفاصيل. ماذا حدث ومتى؟ لا تدرج أرقام الهواتف أو عناوين البريد الإلكتروني.', 'Proporciona todos los detalles posibles. ¿Qué ocurrió y cuándo? No incluyas teléfonos ni correos electrónicos.'],
  ['Write a message…', 'Écrire un message…', 'Escrever uma mensagem…', 'اكتب رسالة…', 'Escribe un mensaje…'],
  ['Delete', 'Supprimer', 'Eliminar', 'حذف', 'Eliminar'],
  ['Remove', 'Retirer', 'Remover', 'إزالة', 'Quitar'],
  ['Remove image', 'Supprimer l’image', 'Remover imagem', 'إزالة الصورة', 'Quitar imagen'],
  ['YouTube', 'YouTube', 'YouTube', 'YouTube', 'YouTube'],
  ['YouTube Live, Zoom, Facebook Live…', 'YouTube Live, Zoom, Facebook Live…', 'YouTube Live, Zoom, Facebook Live…', 'YouTube Live وZoom وFacebook Live…', 'YouTube Live, Zoom, Facebook Live…'],
  ['Zoom, Google Meet, Teams…', 'Zoom, Google Meet, Teams…', 'Zoom, Google Meet, Teams…', 'Zoom وGoogle Meet وTeams…', 'Zoom, Google Meet, Teams…'],
  ['Search…', 'Rechercher…', 'Pesquisar…', 'بحث…', 'Buscar…'],
  ['Sort by…', 'Trier par…', 'Ordenar por…', 'ترتيب حسب…', 'Ordenar por…'],
  ['Name or former club', 'Nom ou ancien club', 'Nome ou antigo clube', 'الاسم أو النادي السابق', 'Nombre o antiguo club'],
  ['Active filters', 'Filtres actifs', 'Filtros ativos', 'عوامل التصفية النشطة', 'Filtros activos'],
  ['Job filters', 'Filtres des offres', 'Filtros de vagas', 'عوامل تصفية الوظائف', 'Filtros de empleo'],
  ['Tryout filters', 'Filtres des essais', 'Filtros de testes', 'عوامل تصفية تجارب الأداء', 'Filtros de pruebas'],
  ['Position', 'Poste', 'Posição', 'المركز', 'Posición'],
  ['Region', 'Région', 'Região', 'المنطقة', 'Región'],
  ['Work arrangement', 'Modalité de travail', 'Modalidade de trabalho', 'ترتيب العمل', 'Modalidad de trabajo'],
  ['Staff role', 'Fonction du personnel', 'Função da equipa técnica', 'دور الموظف', 'Función del personal'],
  ['Job type', 'Type d’offre', 'Tipo de vaga', 'نوع الوظيفة', 'Tipo de empleo'],
  ['Sort', 'Trier', 'Ordenar', 'ترتيب', 'Ordenar'],
  ['Search players', 'Rechercher des joueurs', 'Pesquisar jogadores', 'ابحث عن لاعبين', 'Buscar jugadores'],
  ['Search tryouts', 'Rechercher des essais', 'Pesquisar testes', 'ابحث عن تجارب أداء', 'Buscar pruebas'],
  ['Your full name', 'Votre nom complet', 'O seu nome completo', 'اسمك الكامل', 'Tu nombre completo'],
  ['you@example.com', 'vous@exemple.com', 'voce@exemplo.com', 'you@example.com', 'tu@ejemplo.com'],
  ['Choose a strong password', 'Choisissez un mot de passe robuste', 'Escolha uma palavra-passe forte', 'اختر كلمة مرور قوية', 'Elige una contraseña segura'],
  ['No academy player submissions are waiting for review.', 'Aucune soumission de joueur d’académie n’est en attente de vérification.', 'Não há submissões de jogadores da academia à espera de análise.', 'لا توجد طلبات لاعبي أكاديمية بانتظار المراجعة.', 'No hay solicitudes de jugadores de academias pendientes de revisión.'],
  ['No disputes or reports filed yet.', 'Aucun litige ni signalement pour le moment.', 'Ainda não foram apresentadas contestações ou denúncias.', 'لم يتم تقديم أي نزاعات أو بلاغات بعد.', 'Aún no hay disputas ni denuncias.'],
  ['No duplicate uploads detected.', 'Aucun fichier en double détecté.', 'Não foram detetados carregamentos duplicados.', 'لم يتم اكتشاف ملفات مكررة.', 'No se detectaron archivos duplicados.'],
  ['No tryouts pending review.', 'Aucun essai en attente de vérification.', 'Não há testes pendentes de análise.', 'لا توجد تجارب أداء بانتظار المراجعة.', 'No hay pruebas pendientes de revisión.'],
  ['Never request payment from applicants. Legitimate jobs never charge candidates.', 'Ne demandez jamais de paiement aux candidats. Les offres légitimes ne facturent jamais les candidats.', 'Nunca solicite pagamentos aos candidatos. Vagas legítimas nunca cobram aos candidatos.', 'لا تطلب أبدًا أموالًا من المتقدمين. الوظائف الموثوقة لا تفرض رسومًا.', 'Nunca solicites pagos a los candidatos. Los empleos legítimos no cobran a quienes se postulan.'],
  ['All fee-based tryouts are reviewed by our team before going live.', 'Notre équipe vérifie tous les essais payants avant leur publication.', 'A nossa equipa analisa todos os testes pagos antes de serem publicados.', 'يراجع فريقنا جميع تجارب الأداء المدفوعة قبل نشرها.', 'Nuestro equipo revisa todas las pruebas de pago antes de publicarlas.'],
  ['Paid tryouts are reviewed by our team before going live. Posts that suggest “guaranteed selection” or “pay to be selected” are automatically rejected.', 'Notre équipe vérifie les essais payants avant publication. Les annonces promettant une sélection garantie ou payante sont automatiquement rejetées.', 'A nossa equipa analisa os testes pagos antes da publicação. Anúncios que prometam seleção garantida ou paga são rejeitados automaticamente.', 'يراجع فريقنا تجارب الأداء المدفوعة قبل النشر. تُرفض تلقائيًا المنشورات التي تعد باختيار مضمون أو مدفوع.', 'Nuestro equipo revisa las pruebas de pago antes de publicarlas. Se rechazan automáticamente las publicaciones que prometen selección garantizada o de pago.'],
  ['Players are always free — forever.', 'Les joueurs ne paient jamais — c’est définitif.', 'Os jogadores nunca pagam — para sempre.', 'اللاعبون لا يدفعون أبدًا — إلى الأبد.', 'Los jugadores siempre usan SportBridge gratis.'],
  ['All prices in Nigerian Naira (NGN). Billed monthly. Cancel any time.', 'Tous les prix sont en nairas nigérians (NGN). Facturation mensuelle, résiliable à tout moment.', 'Todos os preços são em nairas nigerianas (NGN). Faturação mensal. Cancele quando quiser.', 'جميع الأسعار بالنايرا النيجيري (NGN). تُحتسب شهريًا ويمكن الإلغاء في أي وقت.', 'Todos los precios están en nairas nigerianas (NGN). Facturación mensual. Cancela cuando quieras.'],
  ['Pro plans for players, clubs and agents are coming. Early members get locked-in pricing.', 'Les offres Pro pour les joueurs, clubs et agents arrivent bientôt. Les premiers membres conserveront leur tarif.', 'Os planos Pro para jogadores, clubes e agentes estão a caminho. Os primeiros membros mantêm o preço atual.', 'باقات المحترفين للاعبين والأندية والوكلاء قادمة. سيحصل الأعضاء الأوائل على أسعار ثابتة.', 'Próximamente habrá planes Pro para jugadores, clubes y agentes. Los primeros miembros conservarán su precio.'],
  ['All uploaded files are hashed to detect duplicates. Videos will receive a “SportBridge Verified” watermark. Contact info (phone numbers, emails) in captions is automatically blocked — use the secure inbox instead.', 'Tous les fichiers téléversés sont hachés pour détecter les doublons. Les vidéos reçoivent un filigrane « SportBridge Verified ». Les coordonnées dans les légendes sont bloquées : utilisez la messagerie sécurisée.', 'Todos os ficheiros carregados são identificados para detetar duplicados. Os vídeos recebem a marca de água «SportBridge Verified». Contactos nas legendas são bloqueados: use a caixa de entrada segura.', 'يتم فحص الملفات المرفوعة لاكتشاف التكرار، وتُضاف علامة «SportBridge Verified» إلى الفيديوهات. تُحظر بيانات الاتصال في التعليقات — استخدم صندوق الوارد الآمن.', 'Se comprueba si los archivos subidos están duplicados. Los vídeos reciben la marca «SportBridge Verified». Se bloquean los datos de contacto en los textos: usa la bandeja segura.'],
  ['Connecting players, clubs, academies, agents, scouts, coaches and sporting directors across the world.', 'Nous mettons en relation les joueurs, clubs, académies, agents, recruteurs, entraîneurs et directeurs sportifs du monde entier.', 'Ligamos jogadores, clubes, academias, agentes, olheiros, treinadores e diretores desportivos de todo o mundo.', 'نربط اللاعبين والأندية والأكاديميات والوكلاء والكشافة والمدربين والمديرين الرياضيين حول العالم.', 'Conectamos a jugadores, clubes, academias, agentes, ojeadores, entrenadores y directores deportivos de todo el mundo.'],
  ['Connecting players, clubs, academies, agents, scouts, coaches and sporting directors across the world.', 'Nous mettons en relation les joueurs, clubs, académies, agents, recruteurs, entraîneurs et directeurs sportifs du monde entier.', 'Ligamos jogadores, clubes, academias, agentes, olheiros, treinadores e diretores desportivos de todo o mundo.', 'نربط اللاعبين والأندية والأكاديميات والوكلاء والكشافة والمدربين والمديرين الرياضيين حول العالم.', 'Conectamos a jugadores, clubes, academias, agentes, ojeadores, entrenadores y directores deportivos de todo el mundo.'],
  ['SportBridge connects players, academies, agents, scouts and coaches, but is not a party to any agreement between them and does not process payments between users. Credentials shown on profiles are self-reported unless marked with a Verified badge. Always independently verify who you are dealing with, and never send money to arrange a trial or introduction.', 'SportBridge met en relation les joueurs, académies, agents, recruteurs et entraîneurs, mais n’est partie à aucun accord entre eux et ne traite pas leurs paiements. Les informations sont déclaratives sauf badge Vérifié. Vérifiez toujours votre interlocuteur et ne payez jamais pour un essai ou une mise en relation.', 'O SportBridge liga jogadores, academias, agentes, olheiros e treinadores, mas não é parte de acordos entre eles nem processa pagamentos entre utilizadores. As credenciais são autodeclaradas salvo indicação Verificado. Confirme sempre com quem está a negociar e nunca pague por um teste ou apresentação.', 'يربط سبورت بريدج اللاعبين والأكاديميات والوكلاء والكشافة والمدربين، لكنه ليس طرفًا في اتفاقاتهم ولا يعالج المدفوعات بينهم. بيانات الاعتماد يقدّمها أصحابها ما لم تظهر شارة موثّق. تحقق دائمًا من الطرف الآخر ولا تدفع لترتيب تجربة أو تقديم.', 'SportBridge conecta a jugadores, academias, agentes, ojeadores y entrenadores, pero no forma parte de sus acuerdos ni procesa pagos entre usuarios. Las credenciales son declaradas por cada usuario salvo que aparezca la insignia Verificado. Verifica siempre con quién tratas y nunca pagues por una prueba o presentación.'],
  ['Back to directory', 'Retour à l’annuaire', 'Voltar ao diretório', 'العودة إلى الدليل', 'Volver al directorio'],
  ['Show profile in public player directory', 'Afficher le profil dans l’annuaire public des joueurs', 'Mostrar perfil no diretório público de jogadores', 'إظهار الملف في دليل اللاعبين العام', 'Mostrar perfil en el directorio público de jugadores'],
  ['Showing verified players only', 'Affichage des joueurs vérifiés uniquement', 'A mostrar apenas jogadores verificados', 'يتم عرض اللاعبين الموثّقين فقط', 'Mostrando solo jugadores verificados'],
  ['This profile has not completed NIN + face + history verification.', 'Ce profil n’a pas terminé la vérification NIN, photo du visage et historique.', 'Este perfil não concluiu a verificação de NIN, rosto e histórico.', 'لم يكمل هذا الملف التحقق من رقم NIN والوجه والسجل.', 'Este perfil no ha completado la verificación de NIN, rostro e historial.'],
  ['Unlock this profile to download the full CV.', 'Déverrouillez ce profil pour télécharger le CV complet.', 'Desbloqueie este perfil para descarregar o currículo completo.', 'افتح هذا الملف لتنزيل السيرة الذاتية كاملة.', 'Desbloquea este perfil para descargar el CV completo.'],
  ['Display name', 'Nom affiché', 'Nome apresentado', 'اسم العرض', 'Nombre visible'],
  ['Current country', 'Pays actuel', 'País atual', 'البلد الحالي', 'País actual'],
  ['Supporting evidence (optional)', 'Justificatifs (facultatif)', 'Comprovativos (opcional)', 'مستندات داعمة (اختياري)', 'Pruebas de respaldo (opcional)'],
  ['Reason:', 'Motif :', 'Motivo:', 'السبب:', 'Motivo:'],
  ['Tryout fee', 'Frais d’essai', 'Taxa do teste', 'رسوم تجربة الأداء', 'Cuota de la prueba'],
  ['Tryout flyer / poster', 'Affiche de l’essai', 'Cartaz do teste', 'ملصق تجربة الأداء', 'Cartel de la prueba'],
  ['Venue pictures', 'Photos du lieu', 'Fotografias do local', 'صور المكان', 'Fotos del lugar'],
  ['Verification method', 'Méthode de vérification', 'Método de verificação', 'طريقة التحقق', 'Método de verificación'],
  ['Nigerian NIN', 'NIN nigérian', 'NIN nigeriano', 'رقم NIN النيجيري', 'NIN nigeriano'],
  ['International Passport', 'Passeport international', 'Passaporte internacional', 'جواز سفر دولي', 'Pasaporte internacional'],
  ['Identity document type', 'Type de pièce d’identité', 'Tipo de documento de identidade', 'نوع وثيقة الهوية', 'Tipo de documento de identidad'],
  ['Required for Verification', 'Obligatoire pour la vérification', 'Obrigatório para verificação', 'مطلوب للتحقق', 'Obligatorio para la verificación'],
  ['FIFA TMS Connect ID (optional — auto-verifies badge)', 'Identifiant FIFA TMS Connect (facultatif — vérification automatique du badge)', 'ID FIFA TMS Connect (opcional — verifica automaticamente o selo)', 'معرّف FIFA TMS Connect (اختياري — يوثّق الشارة تلقائيًا)', 'ID de FIFA TMS Connect (opcional: verifica la insignia automáticamente)'],
  ['FIFA TMS ID will be verified against the TMS database by our team.', 'Notre équipe vérifiera l’identifiant FIFA TMS dans la base TMS.', 'A nossa equipa verificará o ID FIFA TMS na base de dados TMS.', 'سيتحقق فريقنا من معرّف FIFA TMS في قاعدة بيانات TMS.', 'Nuestro equipo verificará el ID de FIFA TMS en la base de datos TMS.'],
  ['FIFA Agents ID + International Passport scan', 'Identifiant FIFA Agents + scan du passeport international', 'ID FIFA Agents + digitalização do passaporte internacional', 'معرّف FIFA Agents + نسخة ممسوحة من جواز السفر الدولي', 'ID de FIFA Agents + escaneo del pasaporte internacional'],
  ['Loading profile…', 'Chargement du profil…', 'A carregar perfil…', 'جارٍ تحميل الملف الشخصي…', 'Cargando perfil…'],
  ['Previous photo', 'Photo précédente', 'Fotografia anterior', 'الصورة السابقة', 'Foto anterior'],
  ['Next photo', 'Photo suivante', 'Fotografia seguinte', 'الصورة التالية', 'Foto siguiente'],
  ['Player actions', 'Actions du joueur', 'Ações do jogador', 'إجراءات اللاعب', 'Acciones del jugador'],
  ['Player profile sections', 'Sections du profil du joueur', 'Secções do perfil do jogador', 'أقسام ملف اللاعب', 'Secciones del perfil del jugador'],
  ['Share updates, highlights, live sessions and opportunities with the community.', 'Partagez des actualités, des moments forts, des sessions en direct et des opportunités avec la communauté.', 'Partilhe atualizações, destaques, sessões ao vivo e oportunidades com a comunidade.', 'شارك التحديثات واللقطات والجلسات المباشرة والفرص مع المجتمع.', 'Comparte novedades, mejores momentos, sesiones en directo y oportunidades con la comunidad.'],
  ['An agent or scout to arrange a trial or introduction.', 'Un agent ou un recruteur pour organiser un essai ou une mise en relation.', 'Um agente ou olheiro para organizar um teste ou apresentação.', 'وكيل أو كشاف لترتيب تجربة أداء أو تقديم.', 'Un agente u ojeador para organizar una prueba o presentación.'],
]

const catalog = Object.fromEntries(entries.map(([source, ...values]) => [
  source,
  Object.fromEntries(Object.entries(languageIndexes).map(([language, index]) => [language, values[index - 1]])),
]))

const localText = new WeakMap()
const localAttributes = new WeakMap()
const translatedAttributes = ['aria-label', 'aria-description', 'placeholder', 'title', 'alt']

export function getPreferredLanguage() {
  try {
    const saved = window.localStorage.getItem('sportbridge-language')
    return SUPPORTED_LANGUAGES.some(({ code }) => code === saved) ? saved : 'en'
  } catch (error) {
    console.warn('Could not read the saved language preference.', error)
    return 'en'
  }
}

export function translateText(language, source) {
  const leading = source.match(/^\s*/)?.[0] ?? ''
  const trailing = source.match(/\s*$/)?.[0] ?? ''
  const key = source.trim().replace(/\s+/g, ' ')
  const translated = catalog[key]?.[language]
  return translated ? `${leading}${translated}${trailing}` : source
}

function localizeTextNode(node, language) {
  const current = node.nodeValue ?? ''
  if (!current.trim()) return

  const previous = localText.get(node)
  const source = previous && current === previous.output ? previous.source : current
  const output = translateText(language, source)
  if (output !== current) node.nodeValue = output
  localText.set(node, { source, output })
}

function localizeAttribute(element, attribute, language) {
  const current = element.getAttribute(attribute)
  if (current === null) return

  let attributes = localAttributes.get(element)
  if (!attributes) {
    attributes = new Map()
    localAttributes.set(element, attributes)
  }

  const previous = attributes.get(attribute)
  const source = previous && current === previous.output ? previous.source : current
  const output = translateText(language, source)
  if (output !== current) element.setAttribute(attribute, output)
  attributes.set(attribute, { source, output })
}

function localizeElement(element, language) {
  for (const attribute of translatedAttributes) {
    localizeAttribute(element, attribute, language)
  }

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
  )
  let node = walker.nextNode()
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      localizeTextNode(node, language)
    } else {
      for (const attribute of translatedAttributes) {
        localizeAttribute(node, attribute, language)
      }
    }
    node = walker.nextNode()
  }
}

export function observeLocalization(root, language) {
  localizeElement(root, language)

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        localizeTextNode(mutation.target, language)
      } else if (mutation.type === 'attributes') {
        localizeAttribute(mutation.target, mutation.attributeName, language)
      } else {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType === Node.TEXT_NODE) {
            localizeTextNode(addedNode, language)
          } else if (addedNode.nodeType === Node.ELEMENT_NODE) {
            localizeElement(addedNode, language)
          }
        }
      }
    }
  })

  observer.observe(root, {
    attributes: true,
    attributeFilter: translatedAttributes,
    characterData: true,
    childList: true,
    subtree: true,
  })

  return () => observer.disconnect()
}
