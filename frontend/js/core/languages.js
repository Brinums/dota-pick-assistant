const SUPPORTED_LANGUAGES = ["lv", "en", "ru"];

const TEXTS = {
  lv: {
    "subtitle": "Draft analītika un ieteikumi vienuviet",
    "nav.home": "Sākums",
    "nav.heroes": "Varoņi",
    "nav.recommend": "Ieteikumi",
    "nav.stats": "Statistika",
    "nav.loginRegister": "Ienākt / Reģistrēties",
    "nav.profile": "Konts",
    "nav.admin": "Administrēšana",
    "auth.guest": "Viesis",
    "auth.logout": "Iziet",
    "role.user": "Lietotājs",
    "role.admin": "Administrators",
    "lang.label": "Valoda",
    "lang.lv": "Latviešu",
    "lang.en": "English",
    "lang.ru": "Русский",

    "home.bannerTag": "Adaptive Draft Engine",
    "home.title": "Gudrāki piki pirms katras spēles",
    "home.help": "Veido draftu, analizē varoņu statistiku un iegūsti ieteikumus ar counter/synergy metrikām, izmantojot OpenDota datus un lokālo datubāzi.",
    "home.openRecommendations": "Atvērt ieteikumus",
    "home.viewHeroes": "Skatīt varoņus",
    "home.focusTitle": "Sistēmas fokuss",
    "home.focus1": "CounterWR + SynergyWR līdzsvars",
    "home.focus2": "Lomu filtrēšana pēc drafta vajadzības",
    "home.focus3": "Automātiska statistikas atlase un kārtošana",
    "home.feature1.title": "Varoņu analīze",
    "home.feature1.help": "Filtrē pēc atribūta, uzbrukuma tipa, lomas un winrate.",
    "home.feature2.title": "Draft ieteikumi",
    "home.feature2.help": "Izveido savas komandas draftu un saņem top kandidātus ar score.",
    "home.feature3.title": "Meta statistika",
    "home.feature3.help": "Pārskati pickrate un winrate tendences vienotā tabulā.",
    "home.feature4.title": "Admin pārvaldība",
    "home.feature4.help": "Sinhronizē varoņus, pro mačus un ieteikumu datus no OpenDota.",

    "login.title": "Pieslēgšanās",
    "login.help": "Pieslēdzies, lai izmantotu ieteikumu sistēmu un savu kontu.",
    "auth.email": "E-pasts",
    "auth.password": "Parole",
    "auth.showPassword": "Rādīt paroli",
    "auth.hidePassword": "Slēpt paroli",
    "login.submit": "Ienākt",
    "login.switch": "Nav konta? Izveidot kontu",

    "register.title": "Reģistrācija",
    "register.help": "Izveido kontu un pēc tam pieslēdzies sistēmai.",
    "register.username": "Lietotājvārds",
    "register.passwordConfirm": "Apstiprini paroli",
    "register.rulesTitle": "Parolei jāatbilst:",
    "register.rule1": "8+ simboli",
    "register.rule2": "1 lielais burts",
    "register.rule3": "1 mazais burts",
    "register.rule4": "1 cipars",
    "register.rule5": "1 speciālais simbols",
    "register.submit": "Reģistrēties",
    "register.switch": "Jau ir konts? Doties uz pieslēgšanos",

    "heroes.title": "Varoņu katalogs",
    "heroes.help": "Meklē, filtrē un kārto varoņus kā klasiskajos Dota statistikas portālos.",
    "heroes.search": "Meklēt",
    "heroes.searchPlaceholder": "piem. Shadow Fiend",
    "heroes.attr": "Atribūts",
    "heroes.attack": "Uzbrukums",
    "heroes.role": "Loma",
    "heroes.sortBy": "Kārtot pēc",
    "heroes.order": "Secība",
    "heroes.refresh": "Atjaunot sarakstu",
    "heroes.quick": "Ātrā apskate",
    "heroes.quickHelp": "Pirmie varoņi no atlasītā saraksta.",
    "heroes.emptySelection": "Nav izvēlētu varoņu.",
    "heroes.noResults": "Nav atrastu varoņu.",
    "heroes.noAvailableForFilters": "Nav pieejamu varoņu atlasītajiem filtriem.",
    "heroes.winrateLabel": "Winrate",
    "heroes.heroAdded": "Varonis pievienots.",
    "heroes.refreshed": "Varoņu saraksts atjaunots.",
    "heroes.error.alreadyAlly": "Varonis jau ir sabiedroto sarakstā.",
    "heroes.error.maxAllies": "Sabiedroto sarakstā var būt ne vairāk kā 5 varoņi.",
    "heroes.error.alreadyEnemy": "Šis varonis jau ir pretinieku sarakstā.",
    "heroes.error.enemyAlreadySelected": "Varonis jau ir pretinieku sarakstā.",
    "heroes.error.maxEnemies": "Pretinieku sarakstā var būt ne vairāk kā 5 varoņi.",
    "heroes.error.alreadyAllyFromEnemy": "Šis varonis jau ir sabiedroto sarakstā.",
    "heroes.table.hero": "Varonis",
    "heroes.table.attr": "Atribūts",
    "heroes.table.attack": "Uzbrukums",
    "heroes.table.winrate": "Uzvaru %",
    "heroes.table.roles": "Lomas",
    "attack.melee": "Tuvcīņa",
    "attack.ranged": "Tālcīņa",
    "attr.str": "Spēks",
    "attr.agi": "Veiklība",
    "attr.int": "Intelekts",
    "attr.all": "Universāls",
    "common.all": "Visi",
    "common.allF": "Visas",
    "common.add": "Pievienot",
    "common.remove": "Noņemt",
    "common.unavailable": "Nav pieejams",
    "common.noData": "Nav datu.",
    "common.asc": "Augoši",
    "common.desc": "Dilstoši",
    "heroes.sort.name": "Nosaukums",
    "heroes.sort.winrate": "Uzvaru procents",
    "heroes.sort.propick": "Pro spēļu skaits",
    "heroes.sort.date": "Datums",

    "recommend.title": "Ieteikumu sistēma",
    "recommend.help": "Sastādi draftu, salīdzini komandas un ģenerē labāko nākamo piku.",
    "recommend.allies": "Sabiedrotie",
    "recommend.enemies": "Pretinieki",
    "recommend.selectedHeroes": "Izvēlēti varoņi:",
    "recommend.chooseHero": "Izvēlēties varoni",
    "common.clear": "Notīrīt",
    "recommend.desiredRole": "Vēlamā loma",
    "recommend.roleAny": "Jebkura",
    "heroRole.carry": "Kerijs",
    "heroRole.support": "Atbalsts",
    "heroRole.nuker": "Burvestību bojājumi",
    "heroRole.disabler": "Kontrole",
    "heroRole.initiator": "Iniciators",
    "heroRole.durable": "Izturīgs",
    "heroRole.escape": "Bēgšana",
    "heroRole.pusher": "Līniju spiediens",
    "recommend.topN": "Top N",
    "recommend.minMatchup": "Min. matchup spēles",
    "recommend.minSynergy": "Min. synergy spēles",
    "recommend.extraRefresh": "Papildus ielādēt svaigus mačus no OpenDota",
    "recommend.extraMatchCount": "Papildus maču skaits",
    "recommend.extraHelp": "Ja ķeksis nav ieslēgts, ieteikumi tiks veidoti tikai no lokālās datubāzes.",
    "recommend.extraLimit": "Ierobežojums: papildus var ielādēt no 1 līdz 10 mačiem vienā ieteikumu pieprasījumā.",
    "recommend.generate": "Ģenerēt ieteikumus",
    "recommend.newTitle": "Jaunie ieteikumi",
    "recommend.newHelp": "Top izvēles pēc score, confidence un draft sinerģijas.",
    "recommend.myTitle": "Mani ieteikumi",
    "recommend.noResults": "Nav rezultātu. Izvēlies varoņus un ģenerē ieteikumus.",
    "recommend.bestPick": "Labākais picks šim draftam",
    "recommend.alternative": "Alternatīva",
    "recommend.confidence": "Pārliecība",
    "recommend.confidence.low": "Low",
    "recommend.empty": "Nav ieteikumu.",
    "recommend.deleted": "Ieteikums dzēsts.",
    "recommend.loaded": "Ieteikumi ielādēti.",
    "recommend.timeout": "Ieteikumu aprēķins aizņem ilgāku laiku. Mēģini vēlreiz pēc dažām sekundēm.",
    "recommend.validation.minOnePerTeam": "Abās komandās jāizvēlas vismaz 1 varonis.",
    "recommend.validation.maxFivePerTeam": "Katrā komandā drīkst izvēlēties ne vairāk kā 5 varoņus.",
    "recommend.validation.noOverlap": "Viens un tas pats varonis nedrīkst būt abās komandās.",
    "recommend.success.created": "Ieteikumi izveidoti.",
    "recommend.success.localOnly": "Ieteikumi izveidoti tikai no lokālās datubāzes.",
    "recommend.success.quota": "Ieteikumi izveidoti no lokālās datubāzes (OpenDota limits sasniegts).",
    "recommend.success.noNewMatches": "Ieteikumi izveidoti (jauni mači netika atrasti, izmantota lokālā datubāze).",
    "recommend.success.loadedExtraMatches": "Ieteikumi izveidoti. Papildus ielādēti {count} mači.",
    "recommend.success.refreshed": "Ieteikumi izveidoti ar papildus datu atjaunošanu.",
    "common.load": "Ielādēt",
    "common.loading": "Ielādē...",
    "common.calculating": "Aprēķina...",
    "common.games": "spēles",
    "common.delete": "Dzēst",
    "common.deleting": "Dzēš...",
    "auth.loginRequired": "Vispirms jāpieslēdzas sistēmai.",
    "recommend.table.id": "ID",
    "recommend.table.hero": "Varonis",
    "recommend.table.score": "Score",
    "recommend.table.reason": "Pamatojums",
    "recommend.table.action": "Darbība",

    "stats.title": "Statistika",
    "stats.help": "Meta pārskats ar filtrēšanu pēc varoņa īpašībām un pick/win datiem.",
    "stats.filters": "Filtri",
    "stats.searchHero": "Meklēt varoni",
    "stats.searchPlaceholder": "piem. Puck",
    "stats.filterSummary": "Filtri nav piemēroti.",
    "stats.heroStats": "Varoņu statistika",
    "stats.sortWinrate": "Winrate ↓",
    "stats.sortPickrate": "Pickrate",
    "stats.sortWinrateBase": "Winrate",
    "stats.sortPickrateBase": "Pickrate",
    "stats.summary.heroes": "Varoņu skaits",
    "stats.summary.avgWinrate": "Vidējais winrate",
    "stats.summary.avgPickrate": "Vidējais pickrate",
    "stats.summary.topHero": "Top varonis",
    "stats.foundSummary": "Atrasti varoņi: {count} no {total}",
    "stats.loading": "Ielādē statistiku...",
    "stats.loadFailed": "Neizdevās ielādēt statistiku.",
    "stats.openSection": "Atver sadaļu, lai ielādētu statistiku.",
    "stats.table.hero": "Varonis",
    "stats.table.winrate": "Winrate",
    "stats.table.pickrate": "Pickrate",

    "profile.title": "Mans profils",
    "profile.help": "Pārvaldi konta informāciju un nomaini paroli.",
    "profile.noSession": "Nav aktīvas sesijas.",
    "profile.username": "Lietotājvārds",
    "profile.passwordMasked": "••••••••",
    "common.change": "Izmainīt",
    "profile.editUsername": "Mainīt lietotājvārdu",
    "profile.editEmail": "Mainīt e-pastu",
    "profile.editPassword": "Mainīt paroli",
    "common.back": "Atpakaļ",
    "profile.newUsernameHelp": "Ievadi jauno lietotājvārdu un saglabā izmaiņas.",
    "profile.newEmailHelp": "Ievadi jauno e-pastu un saglabā izmaiņas.",
    "profile.changePasswordHelp": "Ievadi esošo un jauno paroli, pēc tam apstiprini izmaiņas.",
    "profile.currentPassword": "Esošā parole",
    "profile.newPassword": "Jaunā parole",
    "profile.newPasswordConfirm": "Apstiprini jauno paroli",
    "profile.updatePassword": "Atjaunināt paroli",

    "admin.title": "Administrēšana",
    "admin.help": "Pieejams tikai ADMIN lietotājam.",
    "admin.sync": "Sinhronizācija",
    "admin.syncHeroes": "Sinhronizēt varoņus no OpenDota",
    "admin.syncing": "Sinhronizē...",
    "admin.heroesSyncedCount": "Varoņi sinhronizēti: {count}.",
    "admin.syncTakesLong": "Sinhronizācija aizņem ilgāku laiku. Pagaidi un mēģini vēlreiz.",
    "admin.users": "Lietotāji",
    "admin.loadUsers": "Ielādēt lietotājus",
    "admin.usersLoaded": "Lietotāji ielādēti.",
    "admin.noUsers": "Nav lietotāju.",
    "admin.roleUpdated": "Loma atjaunota.",
    "admin.cannotRemoveOwnAdmin": "Savu ADMIN lomu noņemt nedrīkst.",
    "admin.cannotDeleteOwnUser": "Pašreizējo administratoru šeit dzēst nedrīkst.",
    "admin.protectedAdmin": "Galvenais administrators ir aizsargāts.",
    "admin.confirmDeleteUser": "Vai tiešām dzēst lietotāju {user}?",
    "admin.userDeleted": "Lietotājs dzēsts.",
    "admin.logs": "Ārējo API pieprasījumu žurnāls",
    "admin.loadLogs": "Ielādēt logus",
    "admin.logsLoaded": "Logi ielādēti.",
    "admin.noLogs": "Nav logu.",
    "admin.table.username": "Lietotājvārds",
    "admin.table.email": "E-pasts",
    "admin.table.role": "Loma",
    "admin.table.action": "Darbība",
    "admin.table.time": "Laiks",
    "admin.table.provider": "Provider",
    "admin.table.endpoint": "Endpoint",
    "admin.table.status": "Status",
    "admin.table.ms": "ms",
    "admin.table.success": "Success",
    "common.save": "Saglabāt",
    "common.yes": "Jā",
    "common.no": "Nē",

    "picker.title": "Izvēlēties varoni",
    "picker.ally": "Izvēlēties sabiedroto varoni",
    "picker.enemy": "Izvēlēties pretinieka varoni",
    "picker.close": "Aizvērt",
    "picker.search": "Meklēt pēc nosaukuma",
    "picker.searchPlaceholder": "piem. Juggernaut",
  },
  en: {
    "subtitle": "Draft analytics and recommendations in one place",
    "nav.home": "Home",
    "nav.heroes": "Heroes",
    "nav.recommend": "Recommendations",
    "nav.stats": "Statistics",
    "nav.loginRegister": "Login / Register",
    "nav.profile": "Account",
    "nav.admin": "Administration",
    "auth.guest": "Guest",
    "auth.logout": "Logout",
    "role.user": "User",
    "role.admin": "Admin",
    "lang.label": "Language",
    "lang.lv": "Latvian",
    "lang.en": "English",
    "lang.ru": "Russian",

    "home.bannerTag": "Adaptive Draft Engine",
    "home.title": "Smarter picks before every match",
    "home.help": "Build your draft, analyze hero stats, and get recommendations with counter/synergy metrics using OpenDota and your local database.",
    "home.openRecommendations": "Open recommendations",
    "home.viewHeroes": "Browse heroes",
    "home.focusTitle": "System focus",
    "home.focus1": "CounterWR + SynergyWR balance",
    "home.focus2": "Role filtering for draft needs",
    "home.focus3": "Automatic stat filtering and sorting",
    "home.feature1.title": "Hero analysis",
    "home.feature1.help": "Filter by attribute, attack type, role, and winrate.",
    "home.feature2.title": "Draft recommendations",
    "home.feature2.help": "Build your team draft and get top candidates by score.",
    "home.feature3.title": "Meta statistics",
    "home.feature3.help": "Review pickrate and winrate trends in one table.",
    "home.feature4.title": "Admin controls",
    "home.feature4.help": "Sync heroes, pro matches, and recommendation data from OpenDota.",

    "login.title": "Login",
    "login.help": "Sign in to use recommendations and your account.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.showPassword": "Show password",
    "auth.hidePassword": "Hide password",
    "login.submit": "Login",
    "login.switch": "No account? Create one",

    "register.title": "Registration",
    "register.help": "Create an account and then sign in.",
    "register.username": "Username",
    "register.passwordConfirm": "Confirm password",
    "register.rulesTitle": "Password must include:",
    "register.rule1": "8+ characters",
    "register.rule2": "1 uppercase letter",
    "register.rule3": "1 lowercase letter",
    "register.rule4": "1 digit",
    "register.rule5": "1 special symbol",
    "register.submit": "Register",
    "register.switch": "Already have an account? Go to login",

    "heroes.title": "Hero catalog",
    "heroes.help": "Search, filter and sort heroes like in classic Dota stats portals.",
    "heroes.search": "Search",
    "heroes.searchPlaceholder": "e.g. Shadow Fiend",
    "heroes.attr": "Attribute",
    "heroes.attack": "Attack",
    "heroes.role": "Role",
    "heroes.sortBy": "Sort by",
    "heroes.order": "Order",
    "heroes.refresh": "Refresh list",
    "heroes.quick": "Quick overview",
    "heroes.quickHelp": "Top heroes from filtered list.",
    "heroes.emptySelection": "No selected heroes.",
    "heroes.noResults": "No heroes found.",
    "heroes.noAvailableForFilters": "No heroes available for selected filters.",
    "heroes.winrateLabel": "Winrate",
    "heroes.heroAdded": "Hero added.",
    "heroes.refreshed": "Hero list refreshed.",
    "heroes.error.alreadyAlly": "Hero is already in allies list.",
    "heroes.error.maxAllies": "Allies list can contain up to 5 heroes.",
    "heroes.error.alreadyEnemy": "This hero is already in enemies list.",
    "heroes.error.enemyAlreadySelected": "Hero is already in enemies list.",
    "heroes.error.maxEnemies": "Enemies list can contain up to 5 heroes.",
    "heroes.error.alreadyAllyFromEnemy": "This hero is already in allies list.",
    "heroes.table.hero": "Hero",
    "heroes.table.attr": "Attribute",
    "heroes.table.attack": "Attack",
    "heroes.table.winrate": "Win rate %",
    "heroes.table.roles": "Roles",
    "attack.melee": "Melee",
    "attack.ranged": "Ranged",
    "attr.str": "Strength",
    "attr.agi": "Agility",
    "attr.int": "Intelligence",
    "attr.all": "Universal",
    "common.all": "All",
    "common.allF": "All",
    "common.add": "Add",
    "common.remove": "Remove",
    "common.unavailable": "Unavailable",
    "common.noData": "No data.",
    "common.asc": "Ascending",
    "common.desc": "Descending",
    "heroes.sort.name": "Name",
    "heroes.sort.winrate": "Win rate",
    "heroes.sort.propick": "Pro picks",
    "heroes.sort.date": "Date",

    "recommend.title": "Recommendation system",
    "recommend.help": "Build a draft, compare teams, and generate the best next pick.",
    "recommend.allies": "Allies",
    "recommend.enemies": "Enemies",
    "recommend.selectedHeroes": "Selected heroes:",
    "recommend.chooseHero": "Choose hero",
    "common.clear": "Clear",
    "recommend.desiredRole": "Desired role",
    "recommend.roleAny": "Any",
    "heroRole.carry": "Carry",
    "heroRole.support": "Support",
    "heroRole.nuker": "Nuker",
    "heroRole.disabler": "Disabler",
    "heroRole.initiator": "Initiator",
    "heroRole.durable": "Durable",
    "heroRole.escape": "Escape",
    "heroRole.pusher": "Pusher",
    "recommend.topN": "Top N",
    "recommend.minMatchup": "Min matchup games",
    "recommend.minSynergy": "Min synergy games",
    "recommend.extraRefresh": "Load fresh matches from OpenDota",
    "recommend.extraMatchCount": "Extra match count",
    "recommend.extraHelp": "If unchecked, recommendations are built only from local database.",
    "recommend.extraLimit": "Limit: you can load from 1 to 10 extra matches per recommendation request.",
    "recommend.generate": "Generate recommendations",
    "recommend.newTitle": "New recommendations",
    "recommend.newHelp": "Top picks by score, confidence and draft synergy.",
    "recommend.myTitle": "My recommendations",
    "recommend.noResults": "No results. Select heroes and generate recommendations.",
    "recommend.bestPick": "Best pick for this draft",
    "recommend.alternative": "Alternative",
    "recommend.confidence": "Confidence",
    "recommend.confidence.low": "Low",
    "recommend.empty": "No recommendations.",
    "recommend.deleted": "Recommendation deleted.",
    "recommend.loaded": "Recommendations loaded.",
    "recommend.timeout": "Recommendation calculation takes longer. Try again in a few seconds.",
    "recommend.validation.minOnePerTeam": "Select at least 1 hero in both teams.",
    "recommend.validation.maxFivePerTeam": "Each team can have at most 5 heroes.",
    "recommend.validation.noOverlap": "The same hero cannot be in both teams.",
    "recommend.success.created": "Recommendations generated.",
    "recommend.success.localOnly": "Recommendations generated only from local database.",
    "recommend.success.quota": "Recommendations generated from local database (OpenDota limit reached).",
    "recommend.success.noNewMatches": "Recommendations generated (no new matches found, local database used).",
    "recommend.success.loadedExtraMatches": "Recommendations generated. Additionally loaded {count} matches.",
    "recommend.success.refreshed": "Recommendations generated with additional data refresh.",
    "common.load": "Load",
    "common.loading": "Loading...",
    "common.calculating": "Calculating...",
    "common.games": "games",
    "common.delete": "Delete",
    "common.deleting": "Deleting...",
    "auth.loginRequired": "Please log in first.",
    "recommend.table.id": "ID",
    "recommend.table.hero": "Hero",
    "recommend.table.score": "Score",
    "recommend.table.reason": "Reason",
    "recommend.table.action": "Action",

    "stats.title": "Statistics",
    "stats.help": "Meta overview with filtering by hero properties and pick/win data.",
    "stats.filters": "Filters",
    "stats.searchHero": "Search hero",
    "stats.searchPlaceholder": "e.g. Puck",
    "stats.filterSummary": "Filters are not applied.",
    "stats.heroStats": "Hero statistics",
    "stats.sortWinrate": "Winrate ↓",
    "stats.sortPickrate": "Pickrate",
    "stats.sortWinrateBase": "Winrate",
    "stats.sortPickrateBase": "Pickrate",
    "stats.summary.heroes": "Heroes count",
    "stats.summary.avgWinrate": "Average winrate",
    "stats.summary.avgPickrate": "Average pickrate",
    "stats.summary.topHero": "Top hero",
    "stats.foundSummary": "Heroes found: {count} of {total}",
    "stats.loading": "Loading statistics...",
    "stats.loadFailed": "Failed to load statistics.",
    "stats.openSection": "Open this section to load statistics.",
    "stats.table.hero": "Hero",
    "stats.table.winrate": "Winrate",
    "stats.table.pickrate": "Pickrate",

    "profile.title": "My profile",
    "profile.help": "Manage account information and change password.",
    "profile.noSession": "No active session.",
    "profile.username": "Username",
    "profile.passwordMasked": "••••••••",
    "common.change": "Edit",
    "profile.editUsername": "Change username",
    "profile.editEmail": "Change email",
    "profile.editPassword": "Change password",
    "common.back": "Back",
    "profile.newUsernameHelp": "Enter a new username and save changes.",
    "profile.newEmailHelp": "Enter a new email and save changes.",
    "profile.changePasswordHelp": "Enter current and new password, then confirm changes.",
    "profile.currentPassword": "Current password",
    "profile.newPassword": "New password",
    "profile.newPasswordConfirm": "Confirm new password",
    "profile.updatePassword": "Update password",

    "admin.title": "Administration",
    "admin.help": "Available only to ADMIN users.",
    "admin.sync": "Synchronization",
    "admin.syncHeroes": "Sync heroes from OpenDota",
    "admin.syncing": "Syncing...",
    "admin.heroesSyncedCount": "Heroes synchronized: {count}.",
    "admin.syncTakesLong": "Synchronization takes longer. Please wait and try again.",
    "admin.users": "Users",
    "admin.loadUsers": "Load users",
    "admin.usersLoaded": "Users loaded.",
    "admin.noUsers": "No users.",
    "admin.roleUpdated": "Role updated.",
    "admin.cannotRemoveOwnAdmin": "You cannot remove your own ADMIN role.",
    "admin.cannotDeleteOwnUser": "You cannot delete the current administrator here.",
    "admin.protectedAdmin": "The main administrator is protected.",
    "admin.confirmDeleteUser": "Delete user {user}?",
    "admin.userDeleted": "User deleted.",
    "admin.logs": "External API request log",
    "admin.loadLogs": "Load logs",
    "admin.logsLoaded": "Logs loaded.",
    "admin.noLogs": "No logs.",
    "admin.table.username": "Username",
    "admin.table.email": "Email",
    "admin.table.role": "Role",
    "admin.table.action": "Action",
    "admin.table.time": "Time",
    "admin.table.provider": "Provider",
    "admin.table.endpoint": "Endpoint",
    "admin.table.status": "Status",
    "admin.table.ms": "ms",
    "admin.table.success": "Success",
    "common.save": "Save",
    "common.yes": "Yes",
    "common.no": "No",

    "picker.title": "Choose hero",
    "picker.ally": "Choose allied hero",
    "picker.enemy": "Choose enemy hero",
    "picker.close": "Close",
    "picker.search": "Search by name",
    "picker.searchPlaceholder": "e.g. Juggernaut",
  },
  ru: {
    "subtitle": "Драфт-аналитика и рекомендации в одном месте",
    "nav.home": "Главная",
    "nav.heroes": "Герои",
    "nav.recommend": "Рекомендации",
    "nav.stats": "Статистика",
    "nav.loginRegister": "Войти / Регистрация",
    "nav.profile": "Аккаунт",
    "nav.admin": "Админка",
    "auth.guest": "Гость",
    "auth.logout": "Выйти",
    "role.user": "Пользователь",
    "role.admin": "Админ",
    "lang.label": "Язык",
    "lang.lv": "Латышский",
    "lang.en": "Английский",
    "lang.ru": "Русский",

    "home.bannerTag": "Adaptive Draft Engine",
    "home.title": "Более умные пики перед каждым матчем",
    "home.help": "Собирай драфт, анализируй статистику героев и получай рекомендации по counter/synergy на основе OpenDota и локальной базы.",
    "home.openRecommendations": "Открыть рекомендации",
    "home.viewHeroes": "Смотреть героев",
    "home.focusTitle": "Фокус системы",
    "home.focus1": "Баланс CounterWR + SynergyWR",
    "home.focus2": "Фильтрация по ролям под драфт",
    "home.focus3": "Автоматическая фильтрация и сортировка статистики",
    "home.feature1.title": "Аналитика героев",
    "home.feature1.help": "Фильтруй по атрибуту, типу атаки, роли и винрейту.",
    "home.feature2.title": "Рекомендации драфта",
    "home.feature2.help": "Собери драфт команды и получи топ-кандидатов по score.",
    "home.feature3.title": "Мета-статистика",
    "home.feature3.help": "Смотри тренды pickrate и winrate в одной таблице.",
    "home.feature4.title": "Админ-управление",
    "home.feature4.help": "Синхронизируй героев, про-матчи и данные рекомендаций из OpenDota.",

    "login.title": "Вход",
    "login.help": "Войди, чтобы использовать рекомендации и аккаунт.",
    "auth.email": "E-mail",
    "auth.password": "Пароль",
    "auth.showPassword": "Показать пароль",
    "auth.hidePassword": "Скрыть пароль",
    "login.submit": "Войти",
    "login.switch": "Нет аккаунта? Создать",

    "register.title": "Регистрация",
    "register.help": "Создай аккаунт и затем войди в систему.",
    "register.username": "Имя пользователя",
    "register.passwordConfirm": "Подтвердите пароль",
    "register.rulesTitle": "Пароль должен содержать:",
    "register.rule1": "8+ символов",
    "register.rule2": "1 заглавную букву",
    "register.rule3": "1 строчную букву",
    "register.rule4": "1 цифру",
    "register.rule5": "1 спецсимвол",
    "register.submit": "Зарегистрироваться",
    "register.switch": "Уже есть аккаунт? Перейти ко входу",

    "heroes.title": "Каталог героев",
    "heroes.help": "Ищи, фильтруй и сортируй героев как на классических Dota-стат сайтах.",
    "heroes.search": "Поиск",
    "heroes.searchPlaceholder": "напр. Shadow Fiend",
    "heroes.attr": "Атрибут",
    "heroes.attack": "Атака",
    "heroes.role": "Роль",
    "heroes.sortBy": "Сортировать по",
    "heroes.order": "Порядок",
    "heroes.refresh": "Обновить список",
    "heroes.quick": "Быстрый обзор",
    "heroes.quickHelp": "Первые герои из отфильтрованного списка.",
    "heroes.emptySelection": "Нет выбранных героев.",
    "heroes.noResults": "Герои не найдены.",
    "heroes.noAvailableForFilters": "Нет героев для выбранных фильтров.",
    "heroes.winrateLabel": "Winrate",
    "heroes.heroAdded": "Герой добавлен.",
    "heroes.refreshed": "Список героев обновлён.",
    "heroes.error.alreadyAlly": "Герой уже в списке союзников.",
    "heroes.error.maxAllies": "В списке союзников может быть максимум 5 героев.",
    "heroes.error.alreadyEnemy": "Этот герой уже в списке противников.",
    "heroes.error.enemyAlreadySelected": "Герой уже в списке противников.",
    "heroes.error.maxEnemies": "В списке противников может быть максимум 5 героев.",
    "heroes.error.alreadyAllyFromEnemy": "Этот герой уже в списке союзников.",
    "heroes.table.hero": "Герой",
    "heroes.table.attr": "Атрибут",
    "heroes.table.attack": "Атака",
    "heroes.table.winrate": "Винрейт %",
    "heroes.table.roles": "Роли",
    "attack.melee": "Ближняя",
    "attack.ranged": "Дальняя",
    "attr.str": "Сила",
    "attr.agi": "Ловкость",
    "attr.int": "Интеллект",
    "attr.all": "Универсал",
    "common.all": "Все",
    "common.allF": "Все",
    "common.add": "Добавить",
    "common.remove": "Удалить",
    "common.unavailable": "Недоступно",
    "common.noData": "Нет данных.",
    "common.asc": "По возрастанию",
    "common.desc": "По убыванию",
    "heroes.sort.name": "Название",
    "heroes.sort.winrate": "Винрейт",
    "heroes.sort.propick": "Про-пики",
    "heroes.sort.date": "Дата",

    "recommend.title": "Система рекомендаций",
    "recommend.help": "Собери драфт, сравни команды и получи лучший следующий пик.",
    "recommend.allies": "Союзники",
    "recommend.enemies": "Противники",
    "recommend.selectedHeroes": "Выбрано героев:",
    "recommend.chooseHero": "Выбрать героя",
    "common.clear": "Очистить",
    "recommend.desiredRole": "Желаемая роль",
    "recommend.roleAny": "Любая",
    "heroRole.carry": "Керри",
    "heroRole.support": "Поддержка",
    "heroRole.nuker": "Нюкер",
    "heroRole.disabler": "Контроль",
    "heroRole.initiator": "Инициатор",
    "heroRole.durable": "Выживаемость",
    "heroRole.escape": "Побег",
    "heroRole.pusher": "Пушер",
    "recommend.topN": "Топ N",
    "recommend.minMatchup": "Мин. matchup игр",
    "recommend.minSynergy": "Мин. synergy игр",
    "recommend.extraRefresh": "Дополнительно загрузить свежие матчи из OpenDota",
    "recommend.extraMatchCount": "Количество доп. матчей",
    "recommend.extraHelp": "Если галочка выключена, рекомендации строятся только из локальной базы.",
    "recommend.extraLimit": "Ограничение: можно загрузить от 1 до 10 доп. матчей за один запрос рекомендаций.",
    "recommend.generate": "Сгенерировать рекомендации",
    "recommend.newTitle": "Новые рекомендации",
    "recommend.newHelp": "Топ-варианты по score, confidence и синергии драфта.",
    "recommend.myTitle": "Мои рекомендации",
    "recommend.noResults": "Нет результатов. Выберите героев и сгенерируйте рекомендации.",
    "recommend.bestPick": "Лучший пик для этого драфта",
    "recommend.alternative": "Альтернатива",
    "recommend.confidence": "Уверенность",
    "recommend.confidence.low": "Низкая",
    "recommend.empty": "Нет рекомендаций.",
    "recommend.deleted": "Рекомендация удалена.",
    "recommend.loaded": "Рекомендации загружены.",
    "recommend.timeout": "Расчёт рекомендаций занимает больше времени. Попробуйте снова через несколько секунд.",
    "recommend.validation.minOnePerTeam": "В обеих командах должен быть выбран минимум 1 герой.",
    "recommend.validation.maxFivePerTeam": "В каждой команде можно выбрать максимум 5 героев.",
    "recommend.validation.noOverlap": "Один и тот же герой не может быть в обеих командах.",
    "recommend.success.created": "Рекомендации созданы.",
    "recommend.success.localOnly": "Рекомендации созданы только из локальной базы данных.",
    "recommend.success.quota": "Рекомендации созданы из локальной базы (лимит OpenDota достигнут).",
    "recommend.success.noNewMatches": "Рекомендации созданы (новые матчи не найдены, использована локальная база).",
    "recommend.success.loadedExtraMatches": "Рекомендации созданы. Дополнительно загружено матчей: {count}.",
    "recommend.success.refreshed": "Рекомендации созданы с дополнительным обновлением данных.",
    "common.load": "Загрузить",
    "common.loading": "Загрузка...",
    "common.calculating": "Расчёт...",
    "common.games": "игр",
    "common.delete": "Удалить",
    "common.deleting": "Удаление...",
    "auth.loginRequired": "Сначала войдите в систему.",
    "recommend.table.id": "ID",
    "recommend.table.hero": "Герой",
    "recommend.table.score": "Score",
    "recommend.table.reason": "Обоснование",
    "recommend.table.action": "Действие",

    "stats.title": "Статистика",
    "stats.help": "Обзор меты с фильтрацией по свойствам героя и данным pick/win.",
    "stats.filters": "Фильтры",
    "stats.searchHero": "Поиск героя",
    "stats.searchPlaceholder": "напр. Puck",
    "stats.filterSummary": "Фильтры не применены.",
    "stats.heroStats": "Статистика героев",
    "stats.sortWinrate": "Winrate ↓",
    "stats.sortPickrate": "Pickrate",
    "stats.sortWinrateBase": "Winrate",
    "stats.sortPickrateBase": "Pickrate",
    "stats.summary.heroes": "Количество героев",
    "stats.summary.avgWinrate": "Средний winrate",
    "stats.summary.avgPickrate": "Средний pickrate",
    "stats.summary.topHero": "Топ герой",
    "stats.foundSummary": "Найдено героев: {count} из {total}",
    "stats.loading": "Загрузка статистики...",
    "stats.loadFailed": "Не удалось загрузить статистику.",
    "stats.openSection": "Открой раздел, чтобы загрузить статистику.",
    "stats.table.hero": "Герой",
    "stats.table.winrate": "Winrate",
    "stats.table.pickrate": "Pickrate",

    "profile.title": "Мой профиль",
    "profile.help": "Управляй данными аккаунта и меняй пароль.",
    "profile.noSession": "Нет активной сессии.",
    "profile.username": "Имя пользователя",
    "profile.passwordMasked": "••••••••",
    "common.change": "Изменить",
    "profile.editUsername": "Изменить имя пользователя",
    "profile.editEmail": "Изменить e-mail",
    "profile.editPassword": "Изменить пароль",
    "common.back": "Назад",
    "profile.newUsernameHelp": "Введи новое имя пользователя и сохрани изменения.",
    "profile.newEmailHelp": "Введи новый e-mail и сохрани изменения.",
    "profile.changePasswordHelp": "Введи текущий и новый пароль, затем подтверди изменения.",
    "profile.currentPassword": "Текущий пароль",
    "profile.newPassword": "Новый пароль",
    "profile.newPasswordConfirm": "Подтвердите новый пароль",
    "profile.updatePassword": "Обновить пароль",

    "admin.title": "Администрирование",
    "admin.help": "Доступно только пользователю ADMIN.",
    "admin.sync": "Синхронизация",
    "admin.syncHeroes": "Синхронизировать героев из OpenDota",
    "admin.syncing": "Синхронизация...",
    "admin.heroesSyncedCount": "Герои синхронизированы: {count}.",
    "admin.syncTakesLong": "Синхронизация занимает больше времени. Подождите и попробуйте снова.",
    "admin.users": "Пользователи",
    "admin.loadUsers": "Загрузить пользователей",
    "admin.usersLoaded": "Пользователи загружены.",
    "admin.noUsers": "Нет пользователей.",
    "admin.roleUpdated": "Роль обновлена.",
    "admin.cannotRemoveOwnAdmin": "Нельзя снять роль ADMIN у текущего администратора.",
    "admin.cannotDeleteOwnUser": "Нельзя удалить текущего администратора здесь.",
    "admin.protectedAdmin": "Главный администратор защищён.",
    "admin.confirmDeleteUser": "Удалить пользователя {user}?",
    "admin.userDeleted": "Пользователь удалён.",
    "admin.logs": "Журнал запросов внешнего API",
    "admin.loadLogs": "Загрузить логи",
    "admin.logsLoaded": "Логи загружены.",
    "admin.noLogs": "Нет логов.",
    "admin.table.username": "Имя пользователя",
    "admin.table.email": "E-mail",
    "admin.table.role": "Роль",
    "admin.table.action": "Действие",
    "admin.table.time": "Время",
    "admin.table.provider": "Provider",
    "admin.table.endpoint": "Endpoint",
    "admin.table.status": "Status",
    "admin.table.ms": "мс",
    "admin.table.success": "Успех",
    "common.save": "Сохранить",
    "common.yes": "Да",
    "common.no": "Нет",

    "picker.title": "Выбрать героя",
    "picker.ally": "Выбрать героя союзников",
    "picker.enemy": "Выбрать героя противников",
    "picker.close": "Закрыть",
    "picker.search": "Поиск по названию",
    "picker.searchPlaceholder": "напр. Juggernaut",
  },
};

const MESSAGE_TRANSLATIONS = {
  "Reģistrācija veiksmīga.": {
    en: "Registration successful.",
    ru: "Регистрация успешна.",
  },
  "Pieslēgšanās veiksmīga.": {
    en: "Login successful.",
    ru: "Вход выполнен успешно.",
  },
  "Varoņu saraksts atjaunots.": {
    en: "Hero list refreshed.",
    ru: "Список героев обновлён.",
  },
  "Vispirms jāpieslēdzas sistēmai.": {
    en: "Please log in first.",
    ru: "Сначала войдите в систему.",
  },
  "Lai izmantotu ieteikumus, vispirms jāpieslēdzas sistēmai.": {
    en: "To use recommendations, please sign in first.",
    ru: "Чтобы использовать рекомендации, сначала войдите в систему.",
  },
  "Ieteikumi ielādēti.": {
    en: "Recommendations loaded.",
    ru: "Рекомендации загружены.",
  },
  "Ieteikums dzēsts.": {
    en: "Recommendation deleted.",
    ru: "Рекомендация удалена.",
  },
  "Ieteikumu aprēķins aizņem ilgāku laiku. Mēģini vēlreiz pēc dažām sekundēm.": {
    en: "Recommendation calculation takes longer. Try again in a few seconds.",
    ru: "Расчёт рекомендаций занимает больше времени. Попробуйте снова через несколько секунд.",
  },
  "Loma atjaunota.": {
    en: "Role updated.",
    ru: "Роль обновлена.",
  },
  "Lietotāji ielādēti.": {
    en: "Users loaded.",
    ru: "Пользователи загружены.",
  },
  "Logi ielādēti.": {
    en: "Logs loaded.",
    ru: "Логи загружены.",
  },
  "Sinhronizācija aizņem ilgāku laiku. Pagaidi un mēģini vēlreiz.": {
    en: "Synchronization takes longer. Please wait and try again.",
    ru: "Синхронизация занимает больше времени. Подождите и попробуйте снова.",
  },
  "Backend atbild pārāk ilgi. Pārbaudi vai serveris darbojas un mēģini vēlreiz.": {
    en: "Backend response timeout. Check if server is running and try again.",
    ru: "Сервер отвечает слишком долго. Проверьте, работает ли сервер, и попробуйте снова.",
  },
  "Neizdevās pieslēgties backend API. Pārbaudi vai serveris darbojas un CORS ir pareizs.": {
    en: "Failed to connect to backend API. Check server and CORS configuration.",
    ru: "Не удалось подключиться к backend API. Проверьте сервер и настройки CORS.",
  },
  "Ievadi lietotājvārdu.": {
    en: "Enter username.",
    ru: "Введите имя пользователя.",
  },
  "Lietotājvārdam jābūt 3 līdz 30 simbolu garam.": {
    en: "Username must be 3 to 30 characters long.",
    ru: "Имя пользователя должно быть длиной от 3 до 30 символов.",
  },
  "Lietotājvārds drīkst saturēt tikai burtus, ciparus, _, . un -.": {
    en: "Username can contain only letters, digits, _, . and -.",
    ru: "Имя пользователя может содержать только буквы, цифры, _, . и -.",
  },
  "Ievadi e-pastu.": {
    en: "Enter email.",
    ru: "Введите e-mail.",
  },
  "Ievadi korektu e-pastu.": {
    en: "Enter a valid email.",
    ru: "Введите корректный e-mail.",
  },
  "E-pasts jau tiek izmantots.": {
    en: "Email is already in use.",
    ru: "E-mail уже используется.",
  },
  "Lietotājvārds jau tiek izmantots.": {
    en: "Username is already in use.",
    ru: "Имя пользователя уже используется.",
  },
  "E-pasts vai lietotājvārds jau tiek izmantots.": {
    en: "Email or username is already in use.",
    ru: "E-mail или имя пользователя уже используется.",
  },
  "Parolei jābūt vismaz 8 simboliem.": {
    en: "Password must be at least 8 characters.",
    ru: "Пароль должен быть не менее 8 символов.",
  },
  "Parolē jābūt vismaz vienam lielajam burtam.": {
    en: "Password must contain at least one uppercase letter.",
    ru: "Пароль должен содержать минимум одну заглавную букву.",
  },
  "Parolē jābūt vismaz vienam mazajam burtam.": {
    en: "Password must contain at least one lowercase letter.",
    ru: "Пароль должен содержать минимум одну строчную букву.",
  },
  "Parolē jābūt vismaz vienam ciparam.": {
    en: "Password must contain at least one digit.",
    ru: "Пароль должен содержать минимум одну цифру.",
  },
  "Parolē jābūt vismaz vienam speciālajam simbolam.": {
    en: "Password must contain at least one special character.",
    ru: "Пароль должен содержать минимум один спецсимвол.",
  },
  "Ievadi paroles apstiprinājumu.": {
    en: "Enter password confirmation.",
    ru: "Введите подтверждение пароля.",
  },
  "Paroles nesakrīt.": {
    en: "Passwords do not match.",
    ru: "Пароли не совпадают.",
  },
  "Ievadi paroli.": {
    en: "Enter password.",
    ru: "Введите пароль.",
  },
  "Lietotājvārds atjaunināts.": {
    en: "Username updated.",
    ru: "Имя пользователя обновлено.",
  },
  "E-pasts atjaunināts.": {
    en: "Email updated.",
    ru: "E-mail обновлён.",
  },
  "Ievadi esošo paroli.": {
    en: "Enter current password.",
    ru: "Введите текущий пароль.",
  },
  "Ievadi jaunās paroles apstiprinājumu.": {
    en: "Enter new password confirmation.",
    ru: "Введите подтверждение нового пароля.",
  },
  "Jaunā parole un apstiprinājums nesakrīt.": {
    en: "New password and confirmation do not match.",
    ru: "Новый пароль и подтверждение не совпадают.",
  },
  "Parole veiksmīgi nomainīta.": {
    en: "Password changed successfully.",
    ru: "Пароль успешно изменён.",
  },
};

const HERO_ROLE_OPTIONS = ["Carry", "Support", "Nuker", "Disabler", "Initiator", "Durable", "Escape", "Pusher"];

function safeString(value) {
  return String(value ?? "").trim();
}

export function createI18nFeature({ state, LANGUAGE_KEY, DEFAULT_LANGUAGE }) {
  function normalizeLanguage(language) {
    const normalized = safeString(language).toLowerCase();
    return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : DEFAULT_LANGUAGE;
  }

  function getLanguage() {
    return normalizeLanguage(state.language || localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE);
  }

  function setLanguage(language) {
    const nextLanguage = normalizeLanguage(language);
    state.language = nextLanguage;
    localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    applyTranslations();
    return nextLanguage;
  }

  function t(key, fallback = "") {
    const language = getLanguage();
    const localized = TEXTS[language]?.[key];
    if (typeof localized === "string") {
      return localized;
    }

    const lvFallback = TEXTS.lv?.[key];
    if (typeof lvFallback === "string") {
      return lvFallback;
    }

    return fallback || key;
  }

  function translateMessage(message) {
    const source = String(message || "");
    const language = getLanguage();

    if (!source || language === "lv") {
      return source;
    }

    const exact = MESSAGE_TRANSLATIONS[source]?.[language];
    if (exact) {
      return exact;
    }

    const messageParts = source.split(/(?<=\.)\s+/).filter(Boolean);
    const translatedParts = messageParts.map((part) => MESSAGE_TRANSLATIONS[part]?.[language] || part);
    if (translatedParts.some((part, index) => part !== messageParts[index])) {
      return translatedParts.join(" ");
    }

    const heroesSyncedMatch = source.match(/^Varoņi sinhronizēti:\s*(\d+)\.$/);
    if (heroesSyncedMatch) {
      if (language === "en") {
        return `Heroes synchronized: ${heroesSyncedMatch[1]}.`;
      }
      if (language === "ru") {
        return `Герои синхронизированы: ${heroesSyncedMatch[1]}.`;
      }
    }

    const extraMatchesLoadedMatch = source.match(/^Ieteikumi izveidoti\. Papildus ielādēti\s*(\d+)\s*mači\.$/);
    if (extraMatchesLoadedMatch) {
      if (language === "en") {
        return `Recommendations generated. Additionally loaded ${extraMatchesLoadedMatch[1]} matches.`;
      }
      if (language === "ru") {
        return `Рекомендации созданы. Дополнительно загружено матчей: ${extraMatchesLoadedMatch[1]}.`;
      }
    }

    return source;
  }

  function setText(selector, key) {
    const node = document.querySelector(selector);
    if (node) {
      node.textContent = t(key);
    }
  }

  function setAttr(selector, attrName, key) {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach((node) => {
      node.setAttribute(attrName, t(key));
    });
  }

  function setPlaceholder(selector, key) {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach((node) => {
      node.setAttribute("placeholder", t(key));
    });
  }

  function setLeadingText(selector, key) {
    const element = document.querySelector(selector);
    if (!element) {
      return;
    }

    const translatedText = t(key);
    [...element.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .forEach((node) => node.remove());
    element.appendChild(document.createTextNode(` ${translatedText}`));
  }

  function setOptionText(selectSelector, value, key) {
    const select = document.querySelector(selectSelector);
    const option = select?.querySelector(`option[value="${value}"]`);
    if (option) {
      option.textContent = t(key);
    }
  }

  function setHeroRoleOptionTexts(selectSelector) {
    HERO_ROLE_OPTIONS.forEach((role) => {
      setOptionText(selectSelector, role, `heroRole.${role.toLowerCase()}`);
    });
  }

  function applyTranslations() {
    const language = getLanguage();
    document.documentElement.setAttribute("lang", language);
    setAttr("#langToggleBtn", "title", "lang.label");

    setText(".subtitle", "subtitle");
    setText('.top-nav .nav-btn[data-view="homeView"]', "nav.home");
    setText('.top-nav .nav-btn[data-view="heroesView"]', "nav.heroes");
    setText('.top-nav .nav-btn[data-view="recommendView"]', "nav.recommend");
    setText('.top-nav .nav-btn[data-view="statsView"]', "nav.stats");
    setText('.top-nav .nav-btn[data-view="loginView"]', "nav.loginRegister");
    setText('.top-nav .nav-btn[data-view="profileView"]', "nav.profile");
    setText('.top-nav .nav-btn[data-view="adminView"]', "nav.admin");
    setText("#logoutBtn", "auth.logout");
    if (!state.user) {
      setText("#currentUserInfo", "auth.guest");
    }

    const languageCodeMap = {
      lv: "LV",
      en: "EU",
      ru: "RU",
    };
    const langCurrentLabel = document.querySelector("#langCurrentLabel");
    if (langCurrentLabel) {
      langCurrentLabel.textContent = languageCodeMap[language] || "LV";
    }
    setText('#langMenu .lang-option[data-lang="lv"] .lang-option-name', "lang.lv");
    setText('#langMenu .lang-option[data-lang="en"] .lang-option-name', "lang.en");
    setText('#langMenu .lang-option[data-lang="ru"] .lang-option-name', "lang.ru");

    setText("#homeView .banner-tag", "home.bannerTag");
    setText("#homeView .hero-banner-main h2", "home.title");
    setText("#homeView .hero-banner-main .section-help", "home.help");
    setText('#homeView .hero-banner-actions [data-jump-view="recommendView"]', "home.openRecommendations");
    setText('#homeView .hero-banner-actions [data-jump-view="heroesView"]', "home.viewHeroes");
    setText("#homeView .hero-banner-side .section-help", "home.focusTitle");

    const focusItems = document.querySelectorAll("#homeView .hero-banner-side .compact-list li");
    if (focusItems[0]) focusItems[0].textContent = t("home.focus1");
    if (focusItems[1]) focusItems[1].textContent = t("home.focus2");
    if (focusItems[2]) focusItems[2].textContent = t("home.focus3");

    const featureCards = document.querySelectorAll("#homeView .feature-grid .feature-card");
    if (featureCards[0]) {
      featureCards[0].querySelector("h3").textContent = t("home.feature1.title");
      featureCards[0].querySelector(".section-help").textContent = t("home.feature1.help");
    }
    if (featureCards[1]) {
      featureCards[1].querySelector("h3").textContent = t("home.feature2.title");
      featureCards[1].querySelector(".section-help").textContent = t("home.feature2.help");
    }
    if (featureCards[2]) {
      featureCards[2].querySelector("h3").textContent = t("home.feature3.title");
      featureCards[2].querySelector(".section-help").textContent = t("home.feature3.help");
    }
    if (featureCards[3]) {
      featureCards[3].querySelector("h3").textContent = t("home.feature4.title");
      featureCards[3].querySelector(".section-help").textContent = t("home.feature4.help");
    }

    setText("#loginView h2", "login.title");
    setText("#loginView .section-help", "login.help");
    setText("#loginForm .auth-field:nth-child(1) label", "auth.email");
    setText("#loginForm .auth-field:nth-child(2) label", "auth.password");
    setText("#loginForm button[type='submit']", "login.submit");
    setText("#openRegisterPanelBtn", "login.switch");

    setText("#registerView h2", "register.title");
    setText("#registerView .section-help", "register.help");
    setText("#registerForm .auth-field:nth-child(1) label", "register.username");
    setText("#registerForm .auth-field:nth-child(2) label", "auth.email");
    setText("#registerForm .auth-field:nth-child(3) label", "auth.password");
    setText("#registerForm .auth-field:nth-child(4) label", "register.passwordConfirm");
    setText("#registerForm .password-rules p", "register.rulesTitle");
    const registerRules = document.querySelectorAll("#registerForm .password-rules-list span");
    if (registerRules[0]) registerRules[0].textContent = t("register.rule1");
    if (registerRules[1]) registerRules[1].textContent = t("register.rule2");
    if (registerRules[2]) registerRules[2].textContent = t("register.rule3");
    if (registerRules[3]) registerRules[3].textContent = t("register.rule4");
    if (registerRules[4]) registerRules[4].textContent = t("register.rule5");
    setText("#registerForm button[type='submit']", "register.submit");
    setText("#backToLoginBtn", "register.switch");

    setText("#heroesView h2", "heroes.title");
    setText("#heroesView > .section-header .section-help", "heroes.help");
    setText("#heroesFilterForm div:nth-child(1) label", "heroes.search");
    setPlaceholder("#heroesFilterForm input[name='search']", "heroes.searchPlaceholder");
    setText("#heroesFilterForm div:nth-child(2) label", "heroes.attr");
    setText("#heroesFilterForm div:nth-child(3) label", "heroes.attack");
    setText("#heroesFilterForm div:nth-child(4) label", "heroes.role");
    setText("#heroesFilterForm div:nth-child(5) label", "heroes.sortBy");
    setText("#heroesFilterForm div:nth-child(6) label", "heroes.order");
    setText("#heroesFilterForm button[type='submit']", "heroes.refresh");
    setText("#heroesView .card .section-header.compact h3", "heroes.quick");
    setText("#heroesView .card .section-header.compact .section-help", "heroes.quickHelp");

    const heroesHead = document.querySelectorAll("#heroesTable thead th");
    if (heroesHead[0]) heroesHead[0].textContent = t("heroes.table.hero");
    if (heroesHead[1]) heroesHead[1].textContent = t("heroes.table.attr");
    if (heroesHead[2]) heroesHead[2].textContent = t("heroes.table.attack");
    if (heroesHead[3]) heroesHead[3].textContent = t("heroes.table.winrate");
    if (heroesHead[4]) heroesHead[4].textContent = t("heroes.table.roles");

    setOptionText("#heroesFilterForm select[name='primaryAttr']", "", "common.all");
    setOptionText("#heroesFilterForm select[name='primaryAttr']", "str", "attr.str");
    setOptionText("#heroesFilterForm select[name='primaryAttr']", "agi", "attr.agi");
    setOptionText("#heroesFilterForm select[name='primaryAttr']", "int", "attr.int");
    setOptionText("#heroesFilterForm select[name='primaryAttr']", "all", "attr.all");
    setOptionText("#heroesFilterForm select[name='attackType']", "", "common.all");
    setOptionText("#heroesFilterForm select[name='attackType']", "Melee", "attack.melee");
    setOptionText("#heroesFilterForm select[name='attackType']", "Ranged", "attack.ranged");
    setOptionText("#heroesFilterForm select[name='role']", "", "common.allF");
    setHeroRoleOptionTexts("#heroesFilterForm select[name='role']");
    setOptionText("#heroesFilterForm select[name='sortBy']", "localizedName", "heroes.sort.name");
    setOptionText("#heroesFilterForm select[name='sortBy']", "rawWinRate", "heroes.sort.winrate");
    setOptionText("#heroesFilterForm select[name='sortBy']", "proPick", "heroes.sort.propick");
    setOptionText("#heroesFilterForm select[name='sortBy']", "createdAt", "heroes.sort.date");
    setOptionText("#heroesFilterForm select[name='order']", "asc", "common.asc");
    setOptionText("#heroesFilterForm select[name='order']", "desc", "common.desc");

    setText("#recommendView h2", "recommend.title");
    setText("#recommendView > .section-header .section-help", "recommend.help");
    setText("#recommendView .team-card-ally h3", "recommend.allies");
    setText("#recommendView .team-card-enemy h3", "recommend.enemies");
    const selectedLabels = document.querySelectorAll("#recommendView .team-card .section-help");
    if (selectedLabels[0]) selectedLabels[0].childNodes[0].textContent = `${t("recommend.selectedHeroes")} `;
    if (selectedLabels[1]) selectedLabels[1].childNodes[0].textContent = `${t("recommend.selectedHeroes")} `;

    setText("#chooseAllyBtn", "recommend.chooseHero");
    setText("#chooseEnemyBtn", "recommend.chooseHero");
    setText("#clearAllyBtn", "common.clear");
    setText("#clearEnemyBtn", "common.clear");
    setText("#recommendForm .filters > div:nth-child(1) label", "recommend.desiredRole");
    setOptionText("#recommendForm select[name='desiredRole']", "", "recommend.roleAny");
    setHeroRoleOptionTexts("#recommendForm select[name='desiredRole']");
    setText("#recommendForm .filters > div:nth-child(2) label", "recommend.topN");
    setText("#recommendForm .filters > div:nth-child(3) label", "recommend.minMatchup");
    setText("#recommendForm .filters > div:nth-child(4) label", "recommend.minSynergy");
    const refreshBlock = document.querySelector("#recommendForm .recommend-refresh-options");
    if (refreshBlock) {
      const [info1, info2] = refreshBlock.querySelectorAll(".section-help");
      setLeadingText("#recommendForm .recommend-refresh-toggle", "recommend.extraRefresh");
      setText("#recommendForm .recommend-refresh-limit label", "recommend.extraMatchCount");
      if (info1) info1.textContent = t("recommend.extraHelp");
      if (info2) info2.textContent = t("recommend.extraLimit");
    }
    setText("#recommendForm > button[type='submit']", "recommend.generate");
    setText("#recommendView .result-panel .section-header h3", "recommend.newTitle");
    setText("#recommendView .result-panel .section-header .section-help", "recommend.newHelp");
    setText("#recommendView .table-card .section-header h3", "recommend.myTitle");
    setText("#loadMyRecommendationsBtn", "common.load");

    const recHead = document.querySelectorAll("#myRecommendationsTable thead th");
    if (recHead[0]) recHead[0].textContent = t("recommend.table.id");
    if (recHead[1]) recHead[1].textContent = t("recommend.table.hero");
    if (recHead[2]) recHead[2].textContent = t("recommend.table.score");
    if (recHead[3]) recHead[3].textContent = t("recommend.table.reason");
    if (recHead[4]) recHead[4].textContent = t("recommend.table.action");

    setText("#statsView h2", "stats.title");
    setText("#statsView > .section-header .section-help", "stats.help");
    setText("#statsView .filter-panel h3", "stats.filters");
    setText("#statsFilterForm div:nth-child(1) label", "stats.searchHero");
    setPlaceholder("#statsFilterForm input[name='search']", "stats.searchPlaceholder");
    setText("#statsFilterForm div:nth-child(2) label", "heroes.attr");
    setText("#statsFilterForm div:nth-child(3) label", "heroes.attack");
    setOptionText("#statsFilterForm select[name='primaryAttr']", "", "common.all");
    setOptionText("#statsFilterForm select[name='primaryAttr']", "str", "attr.str");
    setOptionText("#statsFilterForm select[name='primaryAttr']", "agi", "attr.agi");
    setOptionText("#statsFilterForm select[name='primaryAttr']", "int", "attr.int");
    setOptionText("#statsFilterForm select[name='primaryAttr']", "all", "attr.all");
    setOptionText("#statsFilterForm select[name='attackType']", "", "common.all");
    setOptionText("#statsFilterForm select[name='attackType']", "Melee", "attack.melee");
    setOptionText("#statsFilterForm select[name='attackType']", "Ranged", "attack.ranged");
    setText("#statsByHeroTable thead th:nth-child(1)", "stats.table.hero");
    setText("#statsByHeroTable thead th:nth-child(2)", "stats.table.winrate");
    setText("#statsByHeroTable thead th:nth-child(3)", "stats.table.pickrate");
    setText("#statsView .table-card .section-header h3", "stats.heroStats");

    setText("#profileView h2", "profile.title");
    setText("#profileView > .section-header .section-help", "profile.help");
    const profileSummaryLabels = document.querySelectorAll("#profileOverviewPage .profile-summary-row .profile-label");
    if (profileSummaryLabels[0]) profileSummaryLabels[0].textContent = t("profile.username");
    if (profileSummaryLabels[1]) profileSummaryLabels[1].textContent = t("auth.email");
    if (profileSummaryLabels[2]) profileSummaryLabels[2].textContent = t("auth.password");
    setText("#profileEditUsernameBtn", "common.change");
    setText("#profileEditEmailBtn", "common.change");
    setText("#profileEditPasswordBtn", "common.change");

    setText("#profileUsernamePage .profile-editor-head h3", "profile.editUsername");
    setText("#profileBackFromUsernameBtn", "common.back");
    setText("#profileUsernamePage .profile-editor-card > .section-help", "profile.newUsernameHelp");
    setText("#profileUsernameForm .auth-field label", "profile.username");

    setText("#profileEmailPage .profile-editor-head h3", "profile.editEmail");
    setText("#profileBackFromEmailBtn", "common.back");
    setText("#profileEmailPage .profile-editor-card > .section-help", "profile.newEmailHelp");
    setText("#profileEmailForm .auth-field label", "auth.email");

    setText("#profilePasswordPage .profile-editor-head h3", "profile.editPassword");
    setText("#profileBackFromPasswordBtn", "common.back");
    setText("#profilePasswordPage .profile-editor-card > .section-help", "profile.changePasswordHelp");
    const profilePasswordLabels = document.querySelectorAll("#changePasswordForm .auth-field label");
    if (profilePasswordLabels[0]) profilePasswordLabels[0].textContent = t("profile.currentPassword");
    if (profilePasswordLabels[1]) profilePasswordLabels[1].textContent = t("profile.newPassword");
    if (profilePasswordLabels[2]) profilePasswordLabels[2].textContent = t("profile.newPasswordConfirm");
    setText("#changePasswordForm .password-rules p", "register.rulesTitle");
    const profileRules = document.querySelectorAll("#changePasswordForm .password-rules-list span");
    if (profileRules[0]) profileRules[0].textContent = t("register.rule1");
    if (profileRules[1]) profileRules[1].textContent = t("register.rule2");
    if (profileRules[2]) profileRules[2].textContent = t("register.rule3");
    if (profileRules[3]) profileRules[3].textContent = t("register.rule4");
    if (profileRules[4]) profileRules[4].textContent = t("register.rule5");
    setText("#changePasswordForm .profile-form-actions button[type='submit']", "profile.updatePassword");

    setText("#adminView h2", "admin.title");
    setText("#adminView > .section-header .section-help", "admin.help");
    setText("#syncHeroesBtn", "admin.syncHeroes");
    setText("#loadUsersBtn", "admin.loadUsers");
    setText("#loadLogsBtn", "admin.loadLogs");
    const adminSyncTitle = document.querySelector("#syncHeroesBtn")?.closest(".card")?.querySelector("h3");
    if (adminSyncTitle) {
      adminSyncTitle.textContent = t("admin.sync");
    }
    const adminUsersTitle = document.querySelector("#loadUsersBtn")?.closest(".card")?.querySelector("h3");
    if (adminUsersTitle) {
      adminUsersTitle.textContent = t("admin.users");
    }
    const adminLogsTitle = document.querySelector("#loadLogsBtn")?.closest(".card")?.querySelector("h3");
    if (adminLogsTitle) {
      adminLogsTitle.textContent = t("admin.logs");
    }

    const usersHead = document.querySelectorAll("#usersTable thead th");
    if (usersHead[0]) usersHead[0].textContent = t("recommend.table.id");
    if (usersHead[1]) usersHead[1].textContent = t("admin.table.username");
    if (usersHead[2]) usersHead[2].textContent = t("admin.table.email");
    if (usersHead[3]) usersHead[3].textContent = t("admin.table.role");
    if (usersHead[4]) usersHead[4].textContent = t("admin.table.action");

    const logsHead = document.querySelectorAll("#logsTable thead th");
    if (logsHead[0]) logsHead[0].textContent = t("admin.table.time");
    if (logsHead[1]) logsHead[1].textContent = t("admin.table.provider");
    if (logsHead[2]) logsHead[2].textContent = t("admin.table.endpoint");
    if (logsHead[3]) logsHead[3].textContent = t("admin.table.status");
    if (logsHead[4]) logsHead[4].textContent = t("admin.table.ms");
    if (logsHead[5]) logsHead[5].textContent = t("admin.table.success");

    setText("#pickerTitle", "picker.title");
    setText("#closeHeroPickerBtn", "picker.close");
    setText("#heroPickerModal .modal-filters div:nth-child(1) label", "picker.search");
    setPlaceholder("#pickerSearchInput", "picker.searchPlaceholder");
    setText("#heroPickerModal .modal-filters div:nth-child(2) label", "heroes.attr");
    setText("#heroPickerModal .modal-filters div:nth-child(3) label", "heroes.attack");
    setText("#heroPickerModal .modal-filters div:nth-child(4) label", "heroes.role");

    setOptionText("#pickerAttrSelect", "", "common.all");
    setOptionText("#pickerAttrSelect", "str", "attr.str");
    setOptionText("#pickerAttrSelect", "agi", "attr.agi");
    setOptionText("#pickerAttrSelect", "int", "attr.int");
    setOptionText("#pickerAttrSelect", "all", "attr.all");
    setOptionText("#pickerAttackSelect", "", "common.all");
    setOptionText("#pickerAttackSelect", "Melee", "attack.melee");
    setOptionText("#pickerAttackSelect", "Ranged", "attack.ranged");
    setOptionText("#pickerRoleSelect", "", "common.allF");
    setHeroRoleOptionTexts("#pickerRoleSelect");

    const passwordButtons = document.querySelectorAll("button[data-toggle-password]");
    passwordButtons.forEach((btn) => {
      const isVisible = btn.classList.contains("is-visible");
      const key = isVisible ? "auth.hidePassword" : "auth.showPassword";
      btn.setAttribute("aria-label", t(key));
      btn.setAttribute("title", t(key));
    });
  }

  function wireLanguageSwitcher({ onLanguageChanged } = {}) {
    const toggle = document.querySelector("#langToggleBtn");
    const menu = document.querySelector("#langMenu");
    if (!toggle || !menu) {
      applyTranslations();
      return;
    }

    const closeMenu = () => {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    };

    const syncActiveLanguageOption = () => {
      const current = getLanguage();
      menu.querySelectorAll(".lang-option[data-lang]").forEach((option) => {
        option.classList.toggle("active", option.dataset.lang === current);
      });
    };

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      if (menu.hidden) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    menu.querySelectorAll(".lang-option[data-lang]").forEach((option) => {
      option.addEventListener("click", () => {
        const nextLanguage = option.dataset.lang;
        const changed = setLanguage(nextLanguage);
        syncActiveLanguageOption();
        closeMenu();
        onLanguageChanged?.(changed);
      });
    });

    document.addEventListener("click", (event) => {
      if (menu.hidden) {
        return;
      }
      if (!menu.contains(event.target) && event.target !== toggle) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    setLanguage(getLanguage());
    syncActiveLanguageOption();
  }

  return {
    applyTranslations,
    getLanguage,
    setLanguage,
    t,
    translateMessage,
    wireLanguageSwitcher,
  };
}
