const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, resetPassword, updateProfile, deleteAccount, logout } = require('../controllers/authController'); // Import funkcji z kontrolera
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const logActivity = require('../middleware/logActivityMiddleware');
const multer = require('multer');
const path = require('path');
const db = require('../config/db'); // Twój plik konfiguracyjny z połączeniem do MySQL
const cities = [
"Aleksandrów Kujawski",
"Aleksandrów Łódzki",
"Alwernia",
"Andrychów",
"Annopol",
"Augustów",
"Babimost",
"Baborów",
"Baranów Sandomierski",
"Barcin",
"Barczewo",
"Bardo",
"Barlinek",
"Bartoszyce",
"Barwice",
"Bełchatów",
"Bełżyce",
"Będzin",
"Biała",
"Biała Piska",
"Biała Podlaska",
"Biała Rawska",
"Białobrzegi",
"Białogard",
"Białystok",
"Biecz",
"Bielawa",
"Bielsk Podlaski",
"Bielsko-Biała",
"Bieruń",
"Bierutów",
"Bieżuń",
"Biłgoraj",
"Biskupiec",
"Bisztynek",
"Blachownia",
"Błaszki",
"Błażowa",
"Błonie",
"Bobolice",
"Bobowa",
"Bochnia",
"Bodzentyn",
"Bogatynia",
"Boguchwała",
"Boguszów-Gorce",
"Bojanowo",
"Bolesławiec",
"Bolimów",
"Bolków",
"Borek Wielkopolski",
"Borne Sulinowo",
"Braniewo",
"Brodnica",
"Brok",
"Brusy",
"Brwinów",
"Brzeg",
"Brzeg Dolny",
"Brzesko",
"Brzeszcze",
"Brześć Kujawski",
"Brzozów",
"Buk",
"Bukowno",
"Busko-Zdrój",
"Bychawa",
"Byczyna",
"Bydgoszcz",
"Bystrzyca Kłodzka",
"Bytom",
"Bytom Odrzański",
"Cedynia",
"Chełm",
"Chełmek",
"Chełmno",
"Chełmża",
"Chęciny",
"Chmielnik",
"Chocianów",
"Chociwel",
"Chodecz",
"Chodzież",
"Chojna",
"Chojnice",
"Chojnów",
"Choroszcz",
"Chorzele",
"Chorzów",
"Choszczno",
"Chrzanów",
"Ciechanów",
"Ciechanowiec",
"Ciechocinek",
"Cieszanów",
"Cieszyn",
"Cieżkowice",
"Cybinka",
"Czaplinek",
"Czarna Białostocka",
"Czarna Woda",
"Czarne",
"Czarnków",
"Czarny Dunajec",
"Czeladź",
"Czempiń",
"Czerwieńsk",
"Czerwionka-Leszczyny",
"Czerwińsk nad Wisłą",
"Częstochowa",
"Człopa",
"Człuchów",
"Czyżew",
"Dąbrowa Białostocka",
"Dąbrowa Górnicza",
"Dąbrowa Tarnowska",
"Debrzno",
"Dębica",
"Dęblin",
"Dębno",
"Dobczyce",
"Dobra",
"Dobrodzień",
"Dobrzany",
"Dobrzyń nad Wisłą",
"Dolsk",
"Drawno",
"Drawsko Pomorskie",
"Drezdenko",
"Drobin",
"Drohiczyn",
"Drzewica",
"Duszniki-Zdrój",
"Dynów",
"Działdowo",
"Działoszyce",
"Działoszyn",
"Dziwnów",
"Elbląg",
"Ełk",
"Frampol",
"Frombork",
"Garwolin",
"Gąbin",
"Gdańsk",
"Gdynia",
"Giżycko",
"Głogów",
"Głogówek",
"Głogów Małopolski",
"Głowno",
"Głubczyce",
"Głuchołazy",
"Głuszyca",
"Gniew",
"Gniewkowo",
"Gniezno",
"Gogolin",
"Golczewo",
"Golina",
"Golub-Dobrzyń",
"Gołańcz",
"Gołdap",
"Gołuchów",
"Goniądz",
"Gorlice",
"Gorzów Śląski",
"Gorzów Wielkopolski",
"Góra",
"Góra Kalwaria",
"Górowo Iławeckie",
"Górzno",
"Gostynin",
"Gostyń",
"Gościno",
"Grajewo",
"Grodków",
"Grodzisk Mazowiecki",
"Grodzisk Wielkopolski",
"Grójec",
"Grudziądz",
"Grybów",
"Gryfice",
"Gryfino",
"Gryfów Śląski",
"Hajnówka",
"Halinów",
"Hel",
"Hrubieszów",
"Iława",
"Iłowa",
"Iłża",
"Imielin",
"Ińsko",
"Iwonicz-Zdrój",
"Izbica",
"Izbica Kujawska",
"Jabłonowo Pomorskie",
"Janikowo",
"Janów Lubelski",
"Janowiec Wielkopolski",
"Jarocin",
"Jarosław",
"Jasień",
"Jasło",
"Jastarnia",
"Jastrowie",
"Jastrzębie-Zdrój",
"Jawor",
"Jaworzno",
"Jaworzyna Śląska",
"Jedlicze",
"Jedlina-Zdrój",
"Jedwabne",
"Jelcz-Laskowice",
"Jelenia Góra",
"Jeziorany",
"Jędrzejów",
"Jordanów",
"Józefów",
"Józefów nad Wisłą",
"Kalety",
"Kalisz",
"Kalisz Pomorski",
"Kalwaria Zebrzydowska",
"Kałuszyn",
"Kamienna Góra",
"Kamieniec Ząbkowicki",
"Kamień Krajeński",
"Kamień Pomorski",
"Karczew",
"Kargowa",
"Karlino",
"Karpacz",
"Kartuzy",
"Katowice",
"Kazimierz Dolny",
"Kazimierza Wielka",
"Kąty Wrocławskie",
"Kcynia",
"Kędzierzyn-Koźle",
"Kępice",
"Kępno",
"Kętrzyn",
"Kęty",
"Kielce",
"Kietrz",
"Kisielice",
"Kleczew",
"Kleszczele",
"Klimontów",
"Kluczbork",
"Kłobuck",
"Kłodawa",
"Kłodzko",
"Knurów",
"Knyszyn",
"Kobylin",
"Kock",
"Kolbuszowa",
"Kolno",
"Kolonowskie",
"Koluszki",
"Kołaczyce",
"Kołobrzeg",
"Koło",
"Koniecpol",
"Konin",
"Konstancin-Jeziorna",
"Konstantynów Łódzki",
"Koprzywnica",
"Korfantów",
"Koronowo",
"Korsze",
"Kosów Lacki",
"Koszyce",
"Kościan",
"Kościerzyna",
"Kowal",
"Kowalewo Pomorskie",
"Kowary",
"Koziegłowy",
"Kozienice",
"Koźmin Wielkopolski",
"Kożuchów",
"Kórnik",
"Krajenka",
"Krapkowice",
"Krasnobród",
"Krasnystaw",
"Kraśnik",
"Krobia",
"Krosno",
"Krosno Odrzańskie",
"Krośniewice",
"Krotoszyn",
"Kruszwica",
"Krynica Morska",
"Krynica-Zdrój",
"Krynki",
"Krzanowice",
"Krzepice",
"Krzeszowice",
"Krzywiń",
"Krzyż Wielkopolski",
"Książ Wielkopolski",
"Kudowa-Zdrój",
"Kunów",
"Kutno",
"Kuźnia Raciborska",
"Kwidzyn",
"Legionowo",
"Legnica",
"Lesko",
"Leszno",
"Leśna",
"Leśnica",
"Lewin Brzeski",
"Leżajsk",
"Lębork",
"Lidzbark",
"Lidzbark Warmiński",
"Limanowa",
"Lipiany",
"Lipno",
"Lipsk",
"Lubaczów",
"Lubartów",
"Lubawa",
"Lubawka",
"Lubień Kujawski",
"Lubin",
"Lublin",
"Lubliniec",
"Lubniewice",
"Lubomierz",
"Luboń",
"Lubraniec",
"Lubsko",
"Lutomiersk",
"Lututów",
"Łabiszyn",
"Łapy",
"Łasin",
"Łask",
"Łaskarzew",
"Łaziska Górne",
"Łeba",
"Łęczna",
"Łęczyca",
"Łęknica",
"Łobez",
"Łobżenica",
"Łochów",
"Łomża",
"Łosice",
"Łowicz",
"Łódź",
"Łuków",
"Maków Mazowiecki",
"Maków Podhalański",
"Malbork",
"Małogoszcz",
"Małomice",
"Margonin",
"Marki",
"Maszewo",
"Miasteczko Krajeńskie",
"Miasteczko Śląskie",
"Miastko",
"Miechów",
"Miejska Górka",
"Mielec",
"Mieroszów",
"Mieszkowice",
"Miedzybórz",
"Miedzylesie",
"Miedzyrzec Podlaski",
"Miedzyrzecz",
"Miedzyzdroje",
"Mikstat",
"Milanówek",
"Milicz",
"Miłakowo",
"Miłomłyn",
"Miłosław",
"Mińsk Mazowiecki",
"Mława",
"Młynary",
"Mogielnica",
"Mogilno",
"Mordy",
"Morąg",
"Moryń",
"Mosina",
"Mrągowo",
"Mrocza",
"Mrozy",
"Mszana Dolna",
"Mszczonów",
"Murowana Goślina",
"Muszyna",
"Myszków",
"Mysłowice",
"Myślenice",
"Myślibórz",
"Nakło nad Notecią",
"Nałęczów",
"Nekla",
"Nidzica",
"Niemcza",
"Niemodlin",
"Nieszawa",
"Nisko",
"Nowa Dęba",
"Nowa Ruda",
"Nowa Sarzyna",
"Nowa Sól",
"Nowe",
"Nowe Brzesko",
"Nowe Miasteczko",
"Nowe Miasto",
"Nowe Miasto Lubawskie",
"Nowe Miasto nad Pilicą",
"Nowe Skalmierzyce",
"Nowe Warpno",
"Nowogard",
"Nowogrodziec",
"Nowogród",
"Nowogród Bobrzański",
"Nowy Dwór Gdański",
"Nowy Dwór Mazowiecki",
"Nowy Korczyn",
"Nowy Sącz",
"Nowy Staw",
"Nowy Targ",
"Nowy Tomyśl",
"Nowy Wiśnicz",
"Nysa",
"Oborniki",
"Oborniki Śląskie",
"Obrzycko",
"Odolanów",
"Ogrodzieniec",
"Okonek",
"Olecko",
"Olesno",
"Oleszyce",
"Oleśnica",
"Olkusz",
"Olsztyn",
"Olsztynek",
"Olszyna",
"Oława",
"Opalenica",
"Opatów",
"Opatówek",
"Opoczno",
"Opole",
"Opole Lubelskie",
"Orneta",
"Orzesze",
"Orzysz",
"Osieczna",
"Osiek",
"Osjaków",
"Ostróda",
"Ostrołęka",
"Ostroróg",
"Ostrowiec Świętokrzyski",
"Ostrów Lubelski",
"Ostrów Mazowiecka",
"Ostrów Wielkopolski",
"Ostrzeszów",
"Ośno Lubuskie",
"Oświęcim",
"Otmuchów",
"Otwock",
"Ozimek",
"Ozorków",
"Ożarów",
"Ożarów Mazowiecki",
"Pacanów",
"Pajęczno",
"Pakość",
"Parczew",
"Pasłęk",
"Pasym",
"Pelplin",
"Pełczyce",
"Piaseczno",
"Piaski",
"Piastów",
"Piechowice",
"Piekary Śląskie",
"Pieniężno",
"Pieńsk",
"Pieszyce",
"Pilawa",
"Pilica",
"Pilzno",
"Piła",
"Pińczów",
"Pionki",
"Piotrków Kujawski",
"Piotrków Trybunalski",
"Pisz",
"Piszczac",
"Piwniczna-Zdrój",
"Pleszew",
"Płock",
"Płońsk",
"Płoty",
"Pniewy",
"Pobiedziska",
"Poddębice",
"Podkowa Leśna",
"Pogorzela",
"Polanica-Zdrój",
"Polanów",
"Police",
"Polkowice",
"Połaniec",
"Połczyn-Zdrój",
"Poniatowa",
"Poręba",
"Prabuty",
"Praszka",
"Prochowice",
"Proszowice",
"Prudnik",
"Prusice",
"Pruszcz",
"Pruszcz Gdański",
"Pruszków",
"Przasnysz",
"Przecław",
"Przedbórz",
"Przedecz",
"Przemków",
"Przemyśl",
"Przeworsk",
"Przysucha",
"Pszczyna",
"Pszów",
"Puck",
"Puławy",
"Pułtusk",
"Puńsk",
"Pyrzyce",
"Pyskowice",
"Rabka-Zdrój",
"Raciąż",
"Racibórz",
"Radków",
"Radlin",
"Radom",
"Radomsko",
"Radomyśl Wielki",
"Radymno",
"Radziejów",
"Radzionków",
"Radzyń Chełmiński",
"Radzyń Podlaski",
"Rajgród",
"Rakoniewice",
"Raszków",
"Rawa Mazowiecka",
"Rawicz",
"Recz",
"Reda",
"Rejowiec",
"Rejowiec Fabryczny",
"Resko",
"Reszel",
"Rogoźno",
"Ropczyce",
"Różan",
"Ruciane-Nida",
"Rudnik nad Sanem",
"Rumia",
"Rybnik",
"Rychwał",
"Rychtal",
"Rydułtowy",
"Rydzyna",
"Ryglice",
"Ryki",
"Rymanów",
"Ryn",
"Rypin",
"Rzepin",
"Rzeszów",
"Sandomierz",
"Sanok",
"Sejny",
"Serock",
"Sędziszów",
"Sędziszów Małopolski",
"Sępopol",
"Sępólno Krajeńskie",
"Sianów",
"Siechnice",
"Siedlce",
"Siedliszcze",
"Siemianowice Śląskie",
"Siemiatycze",
"Sieniawa",
"Sieradz",
"Sieraków",
"Sierpc",
"Siewierz",
"Skalbmierz",
"Skarżysko-Kamienna",
"Skaryszew",
"Skawina",
"Skępe",
"Skierniewice",
"Skoczów",
"Skoki",
"Skórcz",
"Skwierzyna",
"Sława",
"Sławków",
"Sławno",
"Słomniki",
"Słubice",
"Słupca",
"Słupsk",
"Sobótka",
"Sochaczew",
"Sochocin",
"Sokołów Małopolski",
"Sokołów Podlaski",
"Sokółka",
"Solec Kujawski",
"Solec nad Wisłą",
"Sompolno",
"Sopot",
"Sosnowiec",
"Stalowa Wola",
"Starachowice",
"Stargard",
"Starogard Gdański",
"Stary Sącz",
"Staszów",
"Stawiski",
"Stawiszyn",
"Stąporków",
"Stęszew",
"Stoczek Łukowski",
"Stronie Śląskie",
"Strumień",
"Stryków",
"Strzegom",
"Strzelce Krajeńskie",
"Strzelce Opolskie",
"Strzelin",
"Strzelno",
"Strzyżów",
"Sucha Beskidzka",
"Suchań",
"Suchowola",
"Supraśl",
"Suraż",
"Susz",
"Suwałki",
"Swarzędz",
"Syców",
"Szczebrzeszyn",
"Szczecin",
"Szczecinek",
"Szczekociny",
"Szczucin",
"Szczuczyn",
"Szczytna",
"Szczytno",
"Szczawnica",
"Szczawno-Zdrój",
"Szczyrk",
"Szepietowo",
"Szklarska Poręba",
"Szlichtyngowa",
"Szprotawa",
"Sztum",
"Szubin",
"Szydłów",
"Szydłowiec",
"Ścinawa",
"Ślesin",
"Śmigiel",
"Śrem",
"Środa Śląska",
"Środa Wielkopolska",
"Świątniki Górne",
"Świdnica",
"Świdnik",
"Świdwin",
"Świebodzice",
"Świebodzin",
"Świecie",
"Świeradów-Zdrój",
"Świerzawa",
"Świnoujście",
"Tarczyn",
"Tarnobrzeg",
"Tarnogród",
"Tarnowskie Góry",
"Tarnów",
"Tczew",
"Terespol",
"Tłuszcz",
"Tolkmicko",
"Tomaszów Lubelski",
"Tomaszów Mazowiecki",
"Toruń",
"Torzym",
"Toszek",
"Trzcianka",
"Trzciel",
"Trzcińsko-Zdrój",
"Trzebiatów",
"Trzebinia",
"Trzebnica",
"Trzemeszno",
"Tuchola",
"Tuchów",
"Tuliszków",
"Turek",
"Tuszyn",
"Twardogóra",
"Tychowo",
"Tychy",
"Tyczyn",
"Tykocin",
"Tyszowce",
"Ujazd",
"Ujście",
"Ulanów",
"Uniejów",
"Ustka",
"Ustroń",
"Ustrzyki Dolne",
"Wadowice",
"Wałbrzych",
"Wałcz",
"Warka",
"Warszawa",
"Warta",
"Wasilków",
"Wąbrzeźno",
"Wąchock",
"Wągrowiec",
"Wąsosz",
"Wejherowo",
"Węgliniec",
"Węgorzewo",
"Węgorzyno",
"Węgrów",
"Wiązów",
"Wieleń",
"Wielbark",
"Wielichowo",
"Wieliczka",
"Wieluń",
"Wieruszów",
"Więcbork",
"Wilamowice",
"Wisła",
"Witkowo",
"Witnica",
"Władysławowo",
"Włocławek",
"Włodawa",
"Włodowice",
"Włoszczowa",
"Wodzisław",
"Wodzisław Śląski",
"Wojcieszów",
"Wojkowice",
"Wojnicz",
"Wolbórz",
"Wolbrom",
"Wolin",
"Wolsztyn",
"Wołczyn",
"Wołomin",
"Wołów",
"Woźniki",
"Wrocław",
"Wronki",
"Września",
"Wschowa",
"Wyrzysk",
"Wysoka",
"Wysokie Mazowieckie",
"Wyszków",
"Wyszogród",
"Wyśmierzyce",
"Zabłudów",
"Zabrze",
"Zagórów",
"Zagórz",
"Zakliczyn",
"Zakopane",
"Zakroczym",
"Zalewo",
"Zambrów",
"Zamość",
"Zator",
"Zawadzkie",
"Zawichost",
"Zawidów",
"Zawiercie",
"Ząbki",
"Ząbkowice Śląskie",
"Zbąszyń",
"Zbąszynek",
"Zduny",
"Zduńska Wola",
"Zdzieszowice",
"Zelów",
"Zgierz",
"Zgorzelec",
"Zielona Góra",
"Zielonka",
"Ziębice",
"Złocieniec",
"Złoczew",
"Złotoryja",
"Złotów",
"Złoty Stok",
"Zwierzyniec",
"Żabno",
"Żagań",
"Żarki",
"Żarów",
"Żary",
"Żelechów",
"Żerków",
"Żmigród",
"Żnin",
"Żory",
"Żukowo",
"Żuromin",
"Żychlin",
"Żyrardów",
"Żywiec",];

//debugowanie: sorawdzenie typów zaimportowanych funkcji
console.log('register type:', typeof register);
console.log('login type:', typeof login);
console.log('resetPassword type:', typeof resetPassword);
console.log('updateProfile type:', typeof updateProfile);
console.log('deleteAccount type:', typeof deleteAccount);
console.log('logout type:', typeof logout);

// Konfiguracja multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder do przechowywania zdjęć
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unikalna nazwa pliku
  },
});

const upload = multer({ storage });

// Endpoint rejestracji użytkownika
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Rejestracja nowego użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik został zarejestrowany
 *       400:
 *         description: Błąd walidacji
 */
router.post(
  '/register',
  upload.single('profilePicture'),
  [
    body('email').isEmail().withMessage('Podaj poprawny adres e-mail'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Hasło musi mieć co najmniej 6 znaków'),
    body('name')
      .notEmpty()
      .withMessage('Imię jest wymagane')
      .matches(/^[A-Za-z]+$/)
      .withMessage('Imię może zawierać tylko litery i musi być jednoczłonowe'),
    body('age').isInt({ min: 18 }).withMessage('Strona jest przeznaczona dla osób pełnoletnich'),
    body('city')
      .notEmpty()
      .withMessage('Miasto jest wymagane')
      .custom((value) => {
        if (!cities.includes(value)) {
          throw new Error('Niepoprawna miejscowość');
        }
        return true;
      }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  logActivity, register
);

// Endpoint logowania użytkownika
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Logowanie użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik został zalogowany
 *       400:
 *         description: Błąd walidacji
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Podaj poprawny adres e-mail'),
    body('password').notEmpty().withMessage('Hasło jest wymagane'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // Przejdź do kontrolera, jeśli walidacja się powiedzie
  },
  logActivity, login
);

//Endpoint resetowania hasła
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Zmiana hasła użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik zmienił hasło
 *       400:
 *         description: Błąd walidacji
 */
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Podaj poprawny adres e-mail'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Nowe hasło musi mieć co najmniej 6 znaków'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  resetPassword
);

//Endpoint aktualizacji profilu
/**
 * @swagger
 * /api/auth/update-profile:
 *   post:
 *     summary: Aktualizacja profilu użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profil został zaktualizowany
 *       400:
 *         description: Błąd walidacji
 */
router.put(
  '/update-profile',
  authMiddleware,
  upload.single('profilePicture'), // obsługa pliku
  updateProfile
);

//Endpoint usuwania konta
/**
 * @swagger
 * /api/auth/delete-account:
 *   post:
 *     summary: Usunięcie konta użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik został usunięty
 *       400:
 *         description: Błąd walidacji
 */
router.delete(
  '/delete-account',
  [
    body('password').notEmpty().withMessage('Hasło jest wymagane'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authMiddleware, deleteAccount
);

// Endpoint wylogowania użytkownika
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Wylogowanie użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik został wylogowany
 *       400:
 *         description: Błąd walidacji
 */
router.post('/logout', authMiddleware, logout);

module.exports = router;
