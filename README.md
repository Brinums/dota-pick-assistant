# Dota 2 Pick Assistant

Dota 2 Pick Assistant ir tīmekļa lietotne, kas palīdz lietotājam analizēt Dota 2 varoņus un veidot varoņu izvēles ieteikumus, izmantojot lokālo datubāzi un OpenDota API datus.

Projektā ir izveidots backend ar datubāzes pieslēgumu, autentifikāciju, lietotāju lomām, varoņu katalogu, ieteikumu sistēmu, statistiku un administrēšanas iespējām. Frontend daļa ir izveidota kā statiska HTML, CSS un JavaScript lietotne.

## Izmantotie izstrādes rīki un tehnoloģijas

- HTML, CSS un JavaScript - lietotāja saskarnei.
- Node.js - servera puses izpildei.
- Express.js - backend API izveidei.
- PostgreSQL - datubāzes glabāšanai.
- Prisma ORM - darbam ar datubāzi un migrācijām.
- OpenDota API - ārējo Dota 2 datu iegūšanai.
- Axios - HTTP pieprasījumiem uz ārējām API.
- JSON Web Token - lietotāju autorizācijai.
- bcryptjs - paroļu šifrēšanai.
- Zod - ievades datu validācijai.
- Morgan - servera pieprasījumu žurnalēšanai.
- Nodemon - backend izstrādes režīma palaišanai.
- Git un GitHub - versiju kontrolei.
- WSL - Windows Subsystem for Linux vide projekta izstrādei un termināļa komandu izpildei.

## Izstrādes vide

Projekts tika izstrādāts Windows datorā, izmantojot WSL vidi. WSL tika izmantots kā Linux termināļa vide, kurā tika palaistas projekta komandas, piemēram, `npm install`, Prisma migrācijas, backend serveris un frontend lokālais serveris.

Šāda vide ļāva izstrādāt projektu Windows operētājsistēmā, vienlaikus izmantojot Linux komandvidi, kas ir ērta Node.js, PostgreSQL, Git un citu izstrādes rīku darbam.

## Projekta struktūra

```text
dota-pick-assistant/
├── backend/              # Express.js API un Prisma datubāzes daļa
│   ├── prisma/           # Prisma shēma un migrācijas
│   ├── scripts/          # Palīgskripti, piemēram, demo lietotāju izveide
│   └── src/              # Backend kontrolieri, maršruti, servisi un middleware
├── frontend/             # Statiska frontend lietotne
│   ├── js/               # Frontend JavaScript moduļi
│   ├── styles/           # CSS faili
│   ├── app.js            # Frontend sākuma loģika
│   ├── index.html        # Galvenā HTML lapa
│   └── styles.css        # Galvenais stilu fails
└── README.md
```

## Sistēmas palaišanas vadlīnijas

### 1. Nepieciešamās programmas

Pirms projekta palaišanas datorā jābūt instalētam:

- Node.js;
- npm;
- PostgreSQL;
- Git;
- Python 3, ja frontend tiek palaists ar vienkāršu lokālo serveri.

### 2. Backend sagatavošana

Atvērt termināli projekta mapē un pāriet uz backend mapi:

```bash
cd backend
```

Instalēt backend atkarības:

```bash
npm install
```

Izveidot `.env` failu no piemēra:

```bash
cp .env.example .env
```

Failā `.env` jāpārbauda un, ja nepieciešams, jāpielāgo datubāzes pieslēgums:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dota_pick_assistant?schema=public"
JWT_SECRET="change_me_to_a_long_secret_value"
PORT=4100
```

Izveidot un sinhronizēt datubāzes struktūru:

```bash
npx prisma migrate dev
```

Ģenerēt Prisma klientu:

```bash
npx prisma generate
```

Ja nepieciešami testa lietotāji, palaist demo lietotāju izveides skriptu:

```bash
npm run users:demo
```

Palaist backend izstrādes režīmā:

```bash
npm run dev
```

Pēc veiksmīgas palaišanas backend API darbojas adresē:

```text
http://localhost:4100/api
```

Veselības pārbaudes adrese:

```text
http://localhost:4100/api/health
```

### 3. Frontend palaišana

Atvērt jaunu termināli projekta mapē un pāriet uz frontend mapi:

```bash
cd frontend
```

Palaist lokālo statisko serveri:

```bash
python3 -m http.server 5173 --bind 127.0.0.1
```

Pēc tam pārlūkprogrammā atvērt:

```text
http://127.0.0.1:5173
```

Ja backend ports vai adrese tiek mainīta, frontend API adrese jāpielāgo failā:

```text
frontend/js/config.js
```

### 4. Ieteicamā palaišanas secība

1. Palaist PostgreSQL datubāzi.
2. Palaist backend serveri ar `npm run dev`.
3. Palaist frontend lokālo serveri ar `python3 -m http.server 5173 --bind 127.0.0.1`.
4. Atvērt frontend adresi pārlūkprogrammā.
5. Pieslēgties vai reģistrēt jaunu lietotāju.
6. Administratora lietotājs var sinhronizēt varoņus no OpenDota API.
7. Pēc varoņu ielādes var izmantot varoņu katalogu, statistiku un ieteikumu sistēmu.

## Galvenās npm komandas backend daļā

```bash
npm run dev
```

Palaiž backend izstrādes režīmā ar Nodemon.

```bash
npm run start
```

Palaiž backend parastā režīmā.

```bash
npm run prisma:migrate
```

Palaiž Prisma migrācijas izstrādes režīmā.

```bash
npm run prisma:generate
```

Ģenerē Prisma klientu.

```bash
npm run prisma:studio
```

Atver Prisma Studio datubāzes apskatei.

```bash
npm run users:demo
```

Izveido demo lietotājus testēšanai.

## Piezīmes

- `.env` fails netiek pievienots GitHub repozitorijam, jo tajā atrodas lokālie pieslēguma dati un slepenās vērtības.
- `.env.example` fails ir paredzēts kā piemērs, lai cits izstrādātājs varētu saprast, kādi vides mainīgie projektam ir nepieciešami.
- Frontend daļa ir statiska, tāpēc tai nav nepieciešama atsevišķa npm instalācija.
