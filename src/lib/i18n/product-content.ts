import type { Locale } from "./translations";

export type SpecCategory = {
  title: string;
  items: Array<{ key: string; value: string }>;
};

export type ProductContent = {
  intro: string;
  specs: SpecCategory[];
  note?: string;
};

const iphone16SpecsEn = (storage: string): SpecCategory[] => [
  {
    title: "General",
    items: [
      { key: "Manufacturer", value: "Apple" },
      { key: "Model code", value: "MYE73" },
      { key: "Type", value: "Smartphone" },
      { key: "Series", value: "Apple iPhone 16" },
      { key: "Design", value: "Monoblock" },
      { key: "Control", value: "Touch" },
      { key: "OS", value: "iOS" },
    ],
  },
  {
    title: "Display",
    items: [
      { key: "Diagonal", value: '6.1"' },
      { key: "Resolution", value: "2556×1179 px" },
      { key: "Touch type", value: "Capacitive" },
      { key: "Matrix", value: "OLED" },
      { key: "Pixel density", value: "460 PPI" },
      { key: "Refresh rate", value: "60 Hz" },
    ],
  },
  {
    title: "Memory",
    items: [{ key: "Internal storage", value: storage }],
  },
  {
    title: "Processor",
    items: [
      { key: "Name", value: "A18" },
      { key: "Cores", value: "6-core" },
      { key: "GPU", value: "5-core GPU" },
    ],
  },
  {
    title: "SIM",
    items: [
      { key: "Supported", value: "1 + eSIM" },
      { key: "Form factor", value: "1×SIM" },
      { key: "SIM size", value: "Nano SIM" },
    ],
  },
  {
    title: "Cameras",
    items: [
      { key: "Lenses", value: "2" },
      { key: "Main camera", value: "48 MP, f/1.6, 26mm (wide)" },
      { key: "Secondary", value: "12 MP, f/2.2, 13mm (ultrawide)" },
      { key: "Flash", value: "Yes" },
      { key: "Optical stabilization", value: "Yes" },
      { key: "Optical zoom", value: "2x" },
      { key: "Front camera", value: "12 MP, f/1.9 (wide)" },
    ],
  },
  {
    title: "Photo & Video",
    items: [
      { key: "Main camera video", value: "4K@24/30/60fps, 1080p@30/60fps, 720p@30fps" },
      { key: "Front camera video", value: "4K@24/30/60fps, 1080p@30/60fps" },
      { key: "Slow motion", value: "Yes" },
      { key: "Slow motion recording", value: "1080p@120/240fps" },
    ],
  },
  {
    title: "Connectivity",
    items: [
      { key: "Standards", value: "3G, 2G, 4G (LTE), 5G" },
      { key: "Wireless", value: "Bluetooth, Wi-Fi" },
      { key: "WLAN", value: "Wi-Fi 802.11 a/b/g/n/ac/ax/be" },
      { key: "Bluetooth", value: "v5.3" },
      { key: "GPS", value: "Yes" },
      { key: "Navigation", value: "GPS, A-GPS, GLONASS" },
      { key: "NFC", value: "Yes" },
      { key: "Biometrics", value: "Face ID" },
      { key: "Protection", value: "IP68" },
    ],
  },
  {
    title: "Power",
    items: [
      { key: "Connector", value: "USB Type-C" },
      { key: "Battery", value: "Built-in" },
      { key: "Fast charging", value: "Yes" },
      { key: "Wireless charging", value: "Yes" },
      { key: "Fast charging (Max)", value: "25 W" },
    ],
  },
  {
    title: "Dimensions",
    items: [
      { key: "Weight", value: "170 g" },
      { key: "Height", value: "147.6 mm" },
      { key: "Width", value: "71.6 mm" },
      { key: "Depth", value: "7.8 mm" },
    ],
  },
];

const iphone16SpecsRu = (storage: string): SpecCategory[] => [
  {
    title: "Общие",
    items: [
      { key: "Производитель", value: "Apple" },
      { key: "Код", value: "MYE73" },
      { key: "Тип", value: "Смартфон" },
      { key: "Серия", value: "Apple iPhone 16" },
      { key: "Конструкция", value: "Моноблок" },
      { key: "Управление", value: "Сенсорное" },
      { key: "ОС", value: "iOS" },
    ],
  },
  {
    title: "Экран",
    items: [
      { key: "Диагональ", value: '6.1"' },
      { key: "Разрешение", value: "2556×1179 px" },
      { key: "Тип сенсора", value: "Ёмкостный" },
      { key: "Матрица", value: "OLED" },
      { key: "Плотность пикселей", value: "460 PPI" },
      { key: "Частота обновления", value: "60 Гц" },
    ],
  },
  { title: "Память", items: [{ key: "Внутренняя", value: storage }] },
  {
    title: "Процессор",
    items: [
      { key: "Название", value: "A18" },
      { key: "Ядра", value: "6" },
      { key: "GPU", value: "5-core GPU" },
    ],
  },
  {
    title: "SIM",
    items: [
      { key: "Поддержка", value: "1 + eSIM" },
      { key: "Форм-фактор", value: "1×SIM" },
      { key: "Размер SIM", value: "Nano SIM" },
    ],
  },
  {
    title: "Камеры",
    items: [
      { key: "Объективы", value: "2" },
      { key: "Основная", value: "48 МП, f/1.6, 26mm (wide)" },
      { key: "Вторая", value: "12 МП, f/2.2, 13mm (ultrawide)" },
      { key: "Спалах", value: "Да" },
      { key: "Оптическая стабилизация", value: "Да" },
      { key: "Оптический зум", value: "2x" },
      { key: "Фронтальная", value: "12 МП, f/1.9 (wide)" },
    ],
  },
  {
    title: "Фото и видео",
    items: [
      { key: "Видео основная камера", value: "4K@24/30/60fps, 1080p@30/60fps, 720p@30fps" },
      { key: "Видео фронтальная", value: "4K@24/30/60fps, 1080p@30/60fps" },
      { key: "Замедленная съёмка", value: "Да" },
      { key: "Slow Motion", value: "1080p@120/240fps" },
    ],
  },
  {
    title: "Связь",
    items: [
      { key: "Стандарты", value: "3G, 2G, 4G (LTE), 5G" },
      { key: "Беспроводные", value: "Bluetooth, Wi-Fi" },
      { key: "WLAN", value: "Wi-Fi 802.11 a/b/g/n/ac/ax/be" },
      { key: "Bluetooth", value: "v5.3" },
      { key: "GPS", value: "Да" },
      { key: "Навигация", value: "GPS, A-GPS, GLONASS" },
      { key: "NFC", value: "Да" },
      { key: "Биометрия", value: "Face ID" },
      { key: "Защита", value: "IP68" },
    ],
  },
  {
    title: "Питание",
    items: [
      { key: "Разъём", value: "USB Type-C" },
      { key: "Аккумулятор", value: "Встроенный" },
      { key: "Быстрая зарядка", value: "Да" },
      { key: "Беспроводная зарядка", value: "Да" },
      { key: "Макс. зарядка", value: "25 Вт" },
    ],
  },
  {
    title: "Размеры",
    items: [
      { key: "Вес", value: "170 г" },
      { key: "Высота", value: "147.6 мм" },
      { key: "Ширина", value: "71.6 мм" },
      { key: "Глубина", value: "7.8 мм" },
    ],
  },
];

const iphone16SpecsUk = (storage: string): SpecCategory[] => [
  {
    title: "Загальні",
    items: [
      { key: "Виробник", value: "Apple" },
      { key: "Код виробника", value: "MYE73" },
      { key: "Тип телефону", value: "Смартфон" },
      { key: "Серія смартфона", value: "Apple iPhone 16" },
      { key: "Тип", value: "Моноблок" },
      { key: "Тип управління", value: "Сенсорний" },
      { key: "Операційна система", value: "iOS" },
    ],
  },
  {
    title: "Екран",
    items: [
      { key: "Діагональ екрану", value: '6.1"' },
      { key: "Роздільна здатність", value: "2556×1179 px" },
      { key: "Тип сенсорного екрану", value: "Ємнісний" },
      { key: "Тип матриці", value: "OLED" },
      { key: "Щільність пікселів", value: "460 PPI" },
      { key: "Частота оновлення", value: "60 Гц" },
    ],
  },
  { title: "Пам'ять", items: [{ key: "Внутрішня пам'ять", value: storage }] },
  {
    title: "Процесор",
    items: [
      { key: "Назва процесора", value: "A18" },
      { key: "Кількість ядер", value: "6-ядерний" },
      { key: "Мобільний GPU", value: "5-core GPU" },
    ],
  },
  {
    title: "SIM",
    items: [
      { key: "Кількість SIM", value: "1 + eSIM" },
      { key: "Формфактор слота", value: "1×SIM" },
      { key: "Розмір SIM", value: "Nano SIM" },
    ],
  },
  {
    title: "Камери",
    items: [
      { key: "Кількість об'єктивів", value: "2" },
      { key: "Основна камера", value: "48 MP, f/1.6, 26mm (wide)" },
      { key: "Друга камера", value: "12 MP, f/2.2, 13mm (ultrawide)" },
      { key: "Спалах", value: "Так" },
      { key: "Оптична стабілізація", value: "Так" },
      { key: "Оптичне збільшення", value: "2x" },
      { key: "Фронтальна камера", value: "12 MP, f/1.9 (wide)" },
    ],
  },
  {
    title: "Фото-відео",
    items: [
      { key: "Запис відео основна", value: "4K@24/30/60fps, 1080p@30/60fps, 720p@30fps" },
      { key: "Запис відео фронтальна", value: "4K@24/30/60fps, 1080p@30/60fps" },
      { key: "Уповільнена зйомка", value: "Так" },
      { key: "Slow Motion", value: "1080p@120/240fps" },
    ],
  },
  {
    title: "Технології",
    items: [
      { key: "Стандарт зв'язку", value: "3G, 2G, 4G (LTE), 5G" },
      { key: "Безпровідні", value: "Bluetooth, Wi-Fi" },
      { key: "WLAN", value: "Wi-Fi 802.11 a/b/g/n/ac/ax/be" },
      { key: "Bluetooth", value: "v5.3" },
      { key: "GPS", value: "Так" },
      { key: "Навігація", value: "GPS, A-GPS, GLONASS" },
      { key: "NFC", value: "Так" },
      { key: "Біометричний захист", value: "Face ID" },
      { key: "Ступінь захисту", value: "IP68" },
    ],
  },
  {
    title: "Живлення",
    items: [
      { key: "Роз'єм", value: "USB Type-C" },
      { key: "Тип акумулятора", value: "Вбудований" },
      { key: "Швидка зарядка", value: "Так" },
      { key: "Бездротова зарядка", value: "Так" },
      { key: "Макс. потужність", value: "25 Вт" },
    ],
  },
  {
    title: "Фізичні параметри",
    items: [
      { key: "Вага", value: "170 г" },
      { key: "Висота", value: "147.6 мм" },
      { key: "Ширина", value: "71.6 мм" },
      { key: "Глибина", value: "7.8 мм" },
    ],
  },
];

const iphone16IntroEn = `iPhone 16 — a stylish and powerful smartphone from a renowned brand, designed specifically for Apple Intelligence — a personal intelligence system. With it, you can write, express yourself, and complete various tasks with even less effort. And revolutionary privacy protection keeps your data as secure as possible.

A brand new chip with exceptional energy efficiency
iPhone 16 is powered by the A18 chip, built to support the company's innovations, deliver stable and reliable artificial intelligence, updated features, and the entire system as a whole. It also extends battery life so device performance is uncompromising.

Apple Intelligence personal intelligence system
Discover new tools to help you optimize work on any task. Use apps to check and edit text, transcribe recorded audio to get the most important information right away, and more. Create original Genmoji based on entered text to match any conversation. Plus, even Siri relies on Apple Intelligence for entirely new capabilities to make communication with you more natural than ever. Try these and many other features with iPhone 16.

Action button — convenient access to favorite features
Simply press and hold the Action button on your iPhone 16 to launch the action you need: flashlight, voice memo, silent mode, and more. You can also customize shortcuts to open apps, run a series of tasks, or change actions based on time of day or your location.

New camera system for perfect shots
The versatile iPhone 16 camera system lets you take stunning photos. The 48MP Fusion camera lets you capture stunning ultra-high-resolution shots or zoom in with 2x optical telephoto. The ultrawide camera with autofocus enables close-up macro shots or wider, more immersive photos. And with Spatial Capture, you can even take photos and videos in 3D format viewable with Apple Vision Pro.

Quick camera control with Camera Control button
Take the perfect photo or video with quick access to camera tools via the new Camera Control button on the side. Simply swipe to adjust exposure or depth of field, switch lenses, or use digital zoom to frame your shot.

iOS 18
All updates unfold with iOS 18. Adapt your smartphone to your lifestyle by personalizing the home screen: color app icons any way you like, rearrange and resize apps and widgets, and more.`;

const iphone16IntroRu = `iPhone 16 — стильный и мощный смартфон от известного бренда, созданный специально для Apple Intelligence — системы персонального интеллекта. С его помощью вы сможете писать, выражаться и выполнять разнообразные задачи, прилагая ещё меньше усилий. А революционная защита конфиденциальности максимально надёжно сохранит ваши данные.

Абсолютно новый чип с исключительной энергоэффективностью
iPhone 16 работает на базе A18, созданного для поддержки инноваций компании, обеспечения стабильной и надёжной работы искусственного интеллекта, обновлённых функций и всей системы в целом. Он также увеличивает время работы от аккумулятора, чтобы производительность была безкомпромиссной.

Система персонального интеллекта Apple Intelligence
Откройте для себя новые инструменты, которые помогут оптимизировать работу над любыми задачами. Используйте приложения для проверки и редактирования текста, делайте расшифровки записанного аудио, чтобы сразу получить важную информацию, и многое другое. Создавайте оригинальные Genmoji на основе введённого текста. Кроме того, даже Siri опирается на Apple Intelligence для абсолютно новых возможностей.

Кнопка «Действие» — удобный доступ к любимым функциям
Просто нажмите и удерживайте кнопку «Действие» на вашем iPhone 16, чтобы запустить нужное действие: фонарик, голосовое напоминание, беззвучный режим и т.д. Вы также можете настроить ярлыки для открытия приложений или изменения действий в зависимости от времени суток или местоположения.

Новая система камер для идеальных снимков
Универсальная система камер iPhone 16 позволяет делать отличные фотографии. Камера Fusion 48 МП даёт возможность снимать кадры сверхвысокого разрешения или приближать с помощью 2x оптического телефото. Сверхширокоугольная камера с автофокусом позволяет делать макроснимки или более широкие фотографии. А благодаря функции пространственной съёмки вы можете снимать фото и видео в формате 3D для просмотра с Apple Vision Pro.

Быстрое управление камерой с кнопкой Camera Control
Делайте идеальное фото или видео с быстрым доступом к инструментам камеры благодаря новой кнопке Camera Control на боковой панели. Просто проведите пальцем для настройки экспозиции или глубины резкости.

iOS 18
Все обновления раскрываются благодаря iOS 18. Адаптируйте смартфон под свой стиль жизни, персонализировав главный экран.`;

const iphone16IntroUk = `iPhone 16 — стильний та потужний смартфон від відомого бренду, створений спеціально для Apple Intelligence — системи персонального інтелекту. З допомогою цього ви зможете писати, висловлюватись і виконувати різноманітні завдання, докладаючи ще менше зусиль. А революційний захист конфіденційності максимально надійно вбереже ваші дані.

Абсолютно новий чип з винятковою енергоефективністю
iPhone 16 працює на основі A18, створеного для підтримання інновацій компанії, забезпечення стабільної й надійної роботи штучного інтелекту, оновлених функцій та всієї системи загалом. Він також збільшує час роботи від акумулятора, щоб продуктивність ґаджета була безкомпромісною.

Система персонального інтелекту Apple Intelligence
Відкрийте для себе нові інструменти, які допоможуть оптимізувати роботу над будь-якими завданнями. Використовуйте застосунки для перевірки та редагування тексту, робіть розшифровки записаного аудіо, щоб одразу отримати найважливішу інформацію тощо. Створюйте оригінальні Genmoji на основі введеного тексту. Крім того, навіть Siri спирається на Apple Intelligence для абсолютно нових надздібностей.

Action button — зручне увімкнення улюблених функцій
Просто натисніть і утримуйте кнопку «Дія» на вашому iPhone 16 для того, щоб запустити потрібну дію: ліхтарик, голосове нагадування, беззвучний режим тощо. Ви також можете налаштувати ярлики для відкриття програми, запуску низки завдань або зміни дій залежно від часу доби чи вашого місцеперебування.

Нова система камер для ідеальних знімків
Універсальна система камер iPhone 16 дозволяє робити чудові фотографії. Камера Fusion з роздільною здатністю 48 МП дає змогу знімати приголомшливі кадри надвисокої роздільної здатності або наближати зображення за допомогою функції телефото з 2-кратним оптичним наближенням. Надширококутна камера з автофокусом дозволяє робити макрознімки великим планом або ширші, об'ємніші фотографії.

Швидке керування камерою з кнопкою Camera Control
Робіть ідеальне фото чи відео, маючи змогу швидко отримати доступ до інструментів камери завдяки новій кнопці Camera Control на бічній панелі.

iOS 18
Усі оновлення розкриваються завдяки iOS 18. Адаптуйте смартфон до свого стилю життя, персоналізувавши головний екран.`;

const noteEn = "Note: In cold weather below +5°C, do not turn on the device immediately after delivery to avoid condensation — this may cause damage. Wait 8 hours at room temperature before first use.";
const noteRu = "Примечание: в холодный период при температуре ниже +5°C не включайте устройство сразу после доставки, чтобы избежать конденсата. Подождите 8 часов при комнатной температуре перед первым включением.";
const noteUk = "Зверніть увагу: у холодний період року за температури нижче +5°C не можна вмикати техніку відразу після доставки, щоб уникнути утворення конденсату. До першого увімкнення потрібно почекати 8 годин за кімнатної температури.";

// ——— iPhone 14 Pro Max (Refurbished) ———
const iphone14ProMaxIntroEn = `iPhone 14 Pro Max 128GB Space Black — Refurbished / Like New.

Premium build with Ceramic Shield display, stainless steel frame, and IP68 water resistance. Dynamic Island for quick access to alerts and activities. Super Retina XDR display with ProMotion 10–120Hz and up to 2000 nits peak brightness. 48MP main camera with Photonic Engine. A16 Bionic chip. Up to 23 hours battery life. MagSafe wireless charging. Crash Detection for safety.`;
const iphone14ProMaxIntroRu = `iPhone 14 Pro Max 128GB Space Black — Восстановленный / Почти как новый.

Премиальная сборка: Ceramic Shield, стальная рамка, IP68. Dynamic Island для быстрого доступа к уведомлениям. Дисплей Super Retina XDR с ProMotion 10–120 Гц, яркость до 2000 нит. Основная камера 48 МП, Photonic Engine. Чип A16 Bionic. Автономность до 23 часов. MagSafe. Crash Detection.`;
const iphone14ProMaxIntroUk = `iPhone 14 Pro Max 128GB Space Black — Відновлений / Майже новий.

Преміальна збірка: Ceramic Shield, сталева рамка, IP68. Dynamic Island для швидкого доступу до сповіщень. Дисплей Super Retina XDR з ProMotion 10–120 Гц, яскравість до 2000 ніт. Основна камера 48 МП, Photonic Engine. Чіп A16 Bionic. Автономність до 23 годин. MagSafe. Crash Detection.`;

const iphone14ProMaxSpecsEn = (storage: string): SpecCategory[] => [
  {
    title: "General",
    items: [
      { key: "Manufacturer", value: "Apple" },
      { key: "Model", value: "iPhone 14 Pro Max A2894" },
      { key: "Type", value: "Smartphone" },
      { key: "Condition", value: "Refurbished / Like New" },
      { key: "Design", value: "Monoblock, Stainless steel frame" },
      { key: "OS", value: "iOS" },
    ],
  },
  {
    title: "Display",
    items: [
      { key: "Diagonal", value: '6.7"' },
      { key: "Matrix", value: "Super Retina XDR OLED" },
      { key: "Resolution", value: "2796×1290 px" },
      { key: "Pixel density", value: "460 PPI" },
      { key: "Refresh rate", value: "ProMotion 10–120 Hz" },
      { key: "Peak brightness", value: "2000 nits" },
      { key: "Features", value: "Dynamic Island, Always-On, Ceramic Shield" },
    ],
  },
  { title: "Memory", items: [{ key: "Internal storage", value: storage }] },
  {
    title: "Processor",
    items: [
      { key: "Name", value: "A16 Bionic" },
      { key: "Cores", value: "6-core" },
      { key: "GPU", value: "5-core GPU" },
    ],
  },
  {
    title: "Cameras",
    items: [
      { key: "Lenses", value: "3" },
      { key: "Main camera", value: "48 MP, f/1.78, Photonic Engine" },
      { key: "Ultrawide", value: "12 MP, f/2.2, 13mm" },
      { key: "Telephoto", value: "12 MP, f/2.8, 3× optical zoom" },
      { key: "Front camera", value: "12 MP TrueDepth, f/1.9" },
      { key: "Video", value: "4K@24/30/60fps, ProRes" },
    ],
  },
  {
    title: "Connectivity",
    items: [
      { key: "Standards", value: "5G, 4G LTE" },
      { key: "WLAN", value: "Wi-Fi 802.11 ax" },
      { key: "Bluetooth", value: "v5.3" },
      { key: "Biometrics", value: "Face ID" },
      { key: "Protection", value: "IP68" },
      { key: "Safety", value: "Crash Detection" },
    ],
  },
  {
    title: "Power",
    items: [
      { key: "Connector", value: "Lightning" },
      { key: "Battery", value: "Up to 23h video playback" },
      { key: "Fast charging", value: "Yes" },
      { key: "Wireless charging", value: "MagSafe, Qi" },
    ],
  },
  {
    title: "Dimensions",
    items: [
      { key: "Weight", value: "240 g" },
      { key: "Height", value: "160.7 mm" },
      { key: "Width", value: "77.6 mm" },
      { key: "Depth", value: "7.85 mm" },
    ],
  },
];

const iphone14ProMaxSpecsRu = (storage: string): SpecCategory[] => [
  {
    title: "Общие",
    items: [
      { key: "Производитель", value: "Apple" },
      { key: "Модель", value: "iPhone 14 Pro Max A2894" },
      { key: "Тип", value: "Смартфон" },
      { key: "Состояние", value: "Восстановленный / Почти новый" },
      { key: "Конструкция", value: "Моноблок, стальная рамка" },
      { key: "ОС", value: "iOS" },
    ],
  },
  {
    title: "Экран",
    items: [
      { key: "Диагональ", value: '6.7"' },
      { key: "Матрица", value: "Super Retina XDR OLED" },
      { key: "Разрешение", value: "2796×1290 px" },
      { key: "Плотность", value: "460 PPI" },
      { key: "Частота", value: "ProMotion 10–120 Гц" },
      { key: "Яркость", value: "2000 нит" },
      { key: "Особенности", value: "Dynamic Island, Always-On, Ceramic Shield" },
    ],
  },
  { title: "Память", items: [{ key: "Внутренняя", value: storage }] },
  {
    title: "Процессор",
    items: [
      { key: "Название", value: "A16 Bionic" },
      { key: "Ядра", value: "6" },
      { key: "GPU", value: "5-core GPU" },
    ],
  },
  {
    title: "Камеры",
    items: [
      { key: "Объективы", value: "3" },
      { key: "Основная", value: "48 МП, f/1.78, Photonic Engine" },
      { key: "Ультраширокоугольная", value: "12 МП, f/2.2" },
      { key: "Телеобъектив", value: "12 МП, 3× оптический зум" },
      { key: "Фронтальная", value: "12 МП TrueDepth" },
      { key: "Видео", value: "4K@24/30/60fps, ProRes" },
    ],
  },
  {
    title: "Связь",
    items: [
      { key: "Стандарты", value: "5G, 4G LTE" },
      { key: "Wi-Fi", value: "802.11 ax" },
      { key: "Bluetooth", value: "v5.3" },
      { key: "Биометрия", value: "Face ID" },
      { key: "Защита", value: "IP68" },
      { key: "Безопасность", value: "Crash Detection" },
    ],
  },
  {
    title: "Питание",
    items: [
      { key: "Разъём", value: "Lightning" },
      { key: "Батарея", value: "До 23 ч видео" },
      { key: "Быстрая зарядка", value: "Да" },
      { key: "Беспроводная", value: "MagSafe, Qi" },
    ],
  },
  {
    title: "Размеры",
    items: [
      { key: "Вес", value: "240 г" },
      { key: "Высота", value: "160.7 мм" },
      { key: "Ширина", value: "77.6 мм" },
      { key: "Толщина", value: "7.85 мм" },
    ],
  },
];

const iphone14ProMaxSpecsUk = (storage: string): SpecCategory[] => [
  {
    title: "Загальні",
    items: [
      { key: "Виробник", value: "Apple" },
      { key: "Модель", value: "iPhone 14 Pro Max A2894" },
      { key: "Тип", value: "Смартфон" },
      { key: "Стан", value: "Відновлений / Майже новий" },
      { key: "Конструкція", value: "Моноблок, сталева рамка" },
      { key: "ОС", value: "iOS" },
    ],
  },
  {
    title: "Екран",
    items: [
      { key: "Діагональ", value: '6.7"' },
      { key: "Матриця", value: "Super Retina XDR OLED" },
      { key: "Роздільність", value: "2796×1290 px" },
      { key: "Щільність", value: "460 PPI" },
      { key: "Частота", value: "ProMotion 10–120 Гц" },
      { key: "Яскравість", value: "2000 ніт" },
      { key: "Особливості", value: "Dynamic Island, Always-On, Ceramic Shield" },
    ],
  },
  { title: "Пам'ять", items: [{ key: "Внутрішня", value: storage }] },
  {
    title: "Процесор",
    items: [
      { key: "Назва", value: "A16 Bionic" },
      { key: "Ядра", value: "6" },
      { key: "GPU", value: "5-core GPU" },
    ],
  },
  {
    title: "Камери",
    items: [
      { key: "Об'єктиви", value: "3" },
      { key: "Основна", value: "48 МП, f/1.78, Photonic Engine" },
      { key: "Надширококутна", value: "12 МП, f/2.2" },
      { key: "Телеоб'єктив", value: "12 МП, 3× оптичний зум" },
      { key: "Фронтальна", value: "12 МП TrueDepth" },
      { key: "Відео", value: "4K@24/30/60fps, ProRes" },
    ],
  },
  {
    title: "Зв'язок",
    items: [
      { key: "Стандарти", value: "5G, 4G LTE" },
      { key: "Wi-Fi", value: "802.11 ax" },
      { key: "Bluetooth", value: "v5.3" },
      { key: "Біометрія", value: "Face ID" },
      { key: "Захист", value: "IP68" },
      { key: "Безпека", value: "Crash Detection" },
    ],
  },
  {
    title: "Живлення",
    items: [
      { key: "Роз'єм", value: "Lightning" },
      { key: "Батарея", value: "До 23 год відео" },
      { key: "Швидка зарядка", value: "Так" },
      { key: "Бездротова", value: "MagSafe, Qi" },
    ],
  },
  {
    title: "Розміри",
    items: [
      { key: "Вага", value: "240 г" },
      { key: "Висота", value: "160.7 мм" },
      { key: "Ширина", value: "77.6 мм" },
      { key: "Товщина", value: "7.85 мм" },
    ],
  },
];

function getIphone14ProMaxContent(storage: string) {
  return {
    en: {
      intro: iphone14ProMaxIntroEn,
      specs: iphone14ProMaxSpecsEn(storage),
      note: noteEn,
    },
    ru: {
      intro: iphone14ProMaxIntroRu,
      specs: iphone14ProMaxSpecsRu(storage),
      note: noteRu,
    },
    uk: {
      intro: iphone14ProMaxIntroUk,
      specs: iphone14ProMaxSpecsUk(storage),
      note: noteUk,
    },
  };
}

// ——— iPhone 15 ———
const iphone15SpecsEn = (storage: string): SpecCategory[] => [
  {
    title: "General",
    items: [
      { key: "Manufacturer", value: "Apple" },
      { key: "Type", value: "Smartphone" },
      { key: "Series", value: "Apple iPhone 15" },
      { key: "Design", value: "Monoblock" },
      { key: "Control", value: "Touch" },
      { key: "OS", value: "iOS" },
    ],
  },
  {
    title: "Display",
    items: [
      { key: "Diagonal", value: '6.1"' },
      { key: "Resolution", value: "2556×1179 px" },
      { key: "Touch type", value: "Capacitive" },
      { key: "Matrix", value: "Super Retina XDR OLED" },
      { key: "Pixel density", value: "460 PPI" },
      { key: "Refresh rate", value: "60 Hz" },
      { key: "Features", value: "Dynamic Island, HDR, True Tone" },
    ],
  },
  { title: "Memory", items: [{ key: "Internal storage", value: storage }] },
  {
    title: "Processor",
    items: [
      { key: "Name", value: "A16 Bionic" },
      { key: "Cores", value: "6-core" },
      { key: "GPU", value: "5-core GPU" },
    ],
  },
  {
    title: "SIM",
    items: [
      { key: "Supported", value: "1 + eSIM" },
      { key: "Form factor", value: "1×SIM" },
      { key: "SIM size", value: "Nano SIM" },
    ],
  },
  {
    title: "Cameras",
    items: [
      { key: "Lenses", value: "2" },
      { key: "Main camera", value: "48 MP, f/1.6, 26mm (wide)" },
      { key: "Secondary", value: "12 MP, f/2.2, 13mm (ultrawide)" },
      { key: "Flash", value: "Yes" },
      { key: "Optical stabilization", value: "Yes" },
      { key: "Optical zoom", value: "2x" },
      { key: "Front camera", value: "12 MP, f/1.9 (wide)" },
    ],
  },
  {
    title: "Photo & Video",
    items: [
      { key: "Main camera video", value: "4K@24/30/60fps, 1080p@30/60fps, 720p@30fps" },
      { key: "Front camera video", value: "4K@24/30/60fps, 1080p@30/60fps" },
      { key: "Slow motion", value: "Yes" },
      { key: "Slow motion recording", value: "1080p@120/240fps" },
    ],
  },
  {
    title: "Connectivity",
    items: [
      { key: "Standards", value: "3G, 2G, 4G (LTE), 5G" },
      { key: "Wireless", value: "Bluetooth, Wi-Fi" },
      { key: "WLAN", value: "Wi-Fi 802.11 a/b/g/n/ac/ax" },
      { key: "Bluetooth", value: "v5.3" },
      { key: "GPS", value: "Yes" },
      { key: "Navigation", value: "GPS, A-GPS, GLONASS" },
      { key: "NFC", value: "Yes" },
      { key: "Biometrics", value: "Face ID" },
      { key: "Protection", value: "IP68" },
    ],
  },
  {
    title: "Power",
    items: [
      { key: "Connector", value: "USB Type-C" },
      { key: "Battery", value: "Built-in" },
      { key: "Fast charging", value: "Yes" },
      { key: "Wireless charging", value: "Yes" },
      { key: "Fast charging (Max)", value: "20 W" },
    ],
  },
  {
    title: "Dimensions",
    items: [
      { key: "Weight", value: "171 g" },
      { key: "Height", value: "147.6 mm" },
      { key: "Width", value: "71.6 mm" },
      { key: "Depth", value: "7.8 mm" },
    ],
  },
];

const iphone15SpecsRu = (storage: string): SpecCategory[] => [
  {
    title: "Общие",
    items: [
      { key: "Производитель", value: "Apple" },
      { key: "Тип", value: "Смартфон" },
      { key: "Серия", value: "Apple iPhone 15" },
      { key: "Конструкция", value: "Моноблок" },
      { key: "Управление", value: "Сенсорное" },
      { key: "ОС", value: "iOS" },
    ],
  },
  {
    title: "Экран",
    items: [
      { key: "Диагональ", value: '6.1"' },
      { key: "Разрешение", value: "2556×1179 px" },
      { key: "Тип сенсора", value: "Ёмкостный" },
      { key: "Матрица", value: "Super Retina XDR OLED" },
      { key: "Плотность пикселей", value: "460 PPI" },
      { key: "Частота обновления", value: "60 Гц" },
      { key: "Особенности", value: "Dynamic Island, HDR, True Tone" },
    ],
  },
  { title: "Память", items: [{ key: "Внутренняя", value: storage }] },
  {
    title: "Процессор",
    items: [
      { key: "Название", value: "A16 Bionic" },
      { key: "Ядра", value: "6" },
      { key: "GPU", value: "5-core GPU" },
    ],
  },
  {
    title: "SIM",
    items: [
      { key: "Поддержка", value: "1 + eSIM" },
      { key: "Форм-фактор", value: "1×SIM" },
      { key: "Размер SIM", value: "Nano SIM" },
    ],
  },
  {
    title: "Камеры",
    items: [
      { key: "Объективы", value: "2" },
      { key: "Основная", value: "48 МП, f/1.6, 26mm (wide)" },
      { key: "Вторая", value: "12 МП, f/2.2, 13mm (ultrawide)" },
      { key: "Спалах", value: "Да" },
      { key: "Оптическая стабилизация", value: "Да" },
      { key: "Оптический зум", value: "2x" },
      { key: "Фронтальная", value: "12 МП, f/1.9 (wide)" },
    ],
  },
  {
    title: "Фото и видео",
    items: [
      { key: "Видео основная камера", value: "4K@24/30/60fps, 1080p@30/60fps, 720p@30fps" },
      { key: "Видео фронтальная", value: "4K@24/30/60fps, 1080p@30/60fps" },
      { key: "Замедленная съёмка", value: "Да" },
      { key: "Slow Motion", value: "1080p@120/240fps" },
    ],
  },
  {
    title: "Связь",
    items: [
      { key: "Стандарты", value: "3G, 2G, 4G (LTE), 5G" },
      { key: "Беспроводные", value: "Bluetooth, Wi-Fi" },
      { key: "WLAN", value: "Wi-Fi 802.11 a/b/g/n/ac/ax" },
      { key: "Bluetooth", value: "v5.3" },
      { key: "GPS", value: "Да" },
      { key: "Навигация", value: "GPS, A-GPS, GLONASS" },
      { key: "NFC", value: "Да" },
      { key: "Биометрия", value: "Face ID" },
      { key: "Защита", value: "IP68" },
    ],
  },
  {
    title: "Питание",
    items: [
      { key: "Разъём", value: "USB Type-C" },
      { key: "Аккумулятор", value: "Встроенный" },
      { key: "Быстрая зарядка", value: "Да" },
      { key: "Беспроводная зарядка", value: "Да" },
      { key: "Макс. зарядка", value: "20 Вт" },
    ],
  },
  {
    title: "Размеры",
    items: [
      { key: "Вес", value: "171 г" },
      { key: "Высота", value: "147.6 мм" },
      { key: "Ширина", value: "71.6 мм" },
      { key: "Глубина", value: "7.8 мм" },
    ],
  },
];

const iphone15SpecsUk = (storage: string): SpecCategory[] => [
  {
    title: "Загальні",
    items: [
      { key: "Виробник", value: "Apple" },
      { key: "Тип телефону", value: "Смартфон" },
      { key: "Серія смартфона", value: "Apple iPhone 15" },
      { key: "Тип", value: "Моноблок" },
      { key: "Тип управління", value: "Сенсорний" },
      { key: "Операційна система", value: "iOS" },
    ],
  },
  {
    title: "Екран",
    items: [
      { key: "Діагональ екрану", value: '6.1"' },
      { key: "Роздільна здатність", value: "2556×1179 px" },
      { key: "Тип сенсорного екрану", value: "Ємнісний" },
      { key: "Тип матриці", value: "Super Retina XDR OLED" },
      { key: "Щільність пікселів", value: "460 PPI" },
      { key: "Частота оновлення", value: "60 Гц" },
      { key: "Особливості", value: "Dynamic Island, HDR, True Tone" },
    ],
  },
  { title: "Пам'ять", items: [{ key: "Внутрішня пам'ять", value: storage }] },
  {
    title: "Процесор",
    items: [
      { key: "Назва процесора", value: "A16 Bionic" },
      { key: "Кількість ядер", value: "6-ядерний" },
      { key: "Мобільний GPU", value: "5-core GPU" },
    ],
  },
  {
    title: "SIM",
    items: [
      { key: "Кількість SIM", value: "1 + eSIM" },
      { key: "Формфактор слота", value: "1×SIM" },
      { key: "Розмір SIM", value: "Nano SIM" },
    ],
  },
  {
    title: "Камери",
    items: [
      { key: "Кількість об'єктивів", value: "2" },
      { key: "Основна камера", value: "48 MP, f/1.6, 26mm (wide)" },
      { key: "Друга камера", value: "12 MP, f/2.2, 13mm (ultrawide)" },
      { key: "Спалах", value: "Так" },
      { key: "Оптична стабілізація", value: "Так" },
      { key: "Оптичне збільшення", value: "2x" },
      { key: "Фронтальна камера", value: "12 MP, f/1.9 (wide)" },
    ],
  },
  {
    title: "Фото-відео",
    items: [
      { key: "Запис відео основна", value: "4K@24/30/60fps, 1080p@30/60fps, 720p@30fps" },
      { key: "Запис відео фронтальна", value: "4K@24/30/60fps, 1080p@30/60fps" },
      { key: "Уповільнена зйомка", value: "Так" },
      { key: "Slow Motion", value: "1080p@120/240fps" },
    ],
  },
  {
    title: "Технології",
    items: [
      { key: "Стандарт зв'язку", value: "3G, 2G, 4G (LTE), 5G" },
      { key: "Безпровідні", value: "Bluetooth, Wi-Fi" },
      { key: "WLAN", value: "Wi-Fi 802.11 a/b/g/n/ac/ax" },
      { key: "Bluetooth", value: "v5.3" },
      { key: "GPS", value: "Так" },
      { key: "Навігація", value: "GPS, A-GPS, GLONASS" },
      { key: "NFC", value: "Так" },
      { key: "Біометричний захист", value: "Face ID" },
      { key: "Ступінь захисту", value: "IP68" },
    ],
  },
  {
    title: "Живлення",
    items: [
      { key: "Роз'єм", value: "USB Type-C" },
      { key: "Тип акумулятора", value: "Вбудований" },
      { key: "Швидка зарядка", value: "Так" },
      { key: "Бездротова зарядка", value: "Так" },
      { key: "Макс. потужність", value: "20 Вт" },
    ],
  },
  {
    title: "Фізичні параметри",
    items: [
      { key: "Вага", value: "171 г" },
      { key: "Висота", value: "147.6 мм" },
      { key: "Ширина", value: "71.6 мм" },
      { key: "Глибина", value: "7.8 мм" },
    ],
  },
];

const iphone15IntroEn = `iPhone 15 — a powerful smartphone with advanced camera system and Dynamic Island. Built on the A16 Bionic chip, it delivers outstanding performance for everyday tasks, gaming, and creative work.

48MP Main Camera
Capture stunning high-resolution photos with the advanced 48MP Main camera. Smart HDR 5, Night mode, and next-generation Portrait mode let you take professional-quality shots in any light.

Dynamic Island
A revolutionary way to interact with your iPhone. Dynamic Island stays out of the way until you need it, showing alerts, activities, and more in an elegant, fluid design.

Durable design
Color-infused glass back and aluminum frame. Ceramic Shield front for superior drop performance. IP68 water and dust resistance — up to 6 meters for 30 minutes.

USB-C
Universal connectivity with USB-C. Charge, transfer data, and connect accessories with a single cable.`;

const iphone15IntroRu = `iPhone 15 — мощный смартфон с продвинутой системой камер и Dynamic Island. На базе чипа A16 Bionic он обеспечивает выдающуюся производительность для повседневных задач, игр и творчества.

48МП основная камера
Снимайте потрясающие фото высокого разрешения с продвинутой 48МП основной камерой. Smart HDR 5, ночной режим и портретный режим нового поколения позволяют делать снимки профессионального качества при любом освещении.

Dynamic Island
Революционный способ взаимодействия с iPhone. Dynamic Island остаётся незаметным, пока не понадобится, показывая уведомления, активность и многое другое в элегантном, плавном дизайне.

Прочный дизайн
Стеклянная задняя панель и алюминиевая рамка. Ceramic Shield спереди для превосходной ударопрочности. Защита IP68 от воды и пыли — до 6 метров в течение 30 минут.

USB-C
Универсальное подключение через USB-C. Заряжайте, передавайте данные и подключайте аксессуары одним кабелем.`;

const iphone15IntroUk = `iPhone 15 — потужний смартфон з передовою системою камер та Dynamic Island. На базі чіпа A16 Bionic він забезпечує видатну продуктивність для щоденних завдань, ігор та творчості.

48МП основна камера
Знімайте приголомшливі фото високої роздільної здатності з передовою 48МП основною камерою. Smart HDR 5, нічний режим та портретний режим нового покоління дозволяють робити знімки професійної якості при будь-якому освітленні.

Dynamic Island
Революційний спосіб взаємодії з iPhone. Dynamic Island залишається непомітним, поки не знадобиться, показуючи сповіщення, активність та багато іншого в елегантному, плавному дизайні.

Міцний дизайн
Скляна задня панель та алюмінієва рамка. Ceramic Shield спереду для чудової ударостійкості. Захист IP68 від води та пилу — до 6 метрів протягом 30 хвилин.

USB-C
Універсальне підключення через USB-C. Заряджайте, передавайте дані та підключайте аксесуари одним кабелем.`;

// ——— iPhone 17 Pro Max ———
const iphone17SpecsEn = (): SpecCategory[] => [
  {
    title: "General",
    items: [
      { key: "Manufacturer", value: "Apple" },
      { key: "Type", value: "Smartphone" },
      { key: "Series", value: "Apple iPhone 17 Pro Max" },
      { key: "Design", value: "Titanium unibody" },
      { key: "Control", value: "Touch" },
      { key: "OS", value: "iOS" },
    ],
  },
  {
    title: "Display",
    items: [
      { key: "Diagonal", value: '6.9"' },
      { key: "Resolution", value: "2796×1290 px" },
      { key: "Touch type", value: "Capacitive" },
      { key: "Matrix", value: "Super Retina XDR OLED" },
      { key: "Refresh rate", value: "120 Hz ProMotion" },
      { key: "Features", value: "Dynamic Island, Always-On, Ceramic Shield 2" },
    ],
  },
  { title: "Memory", items: [{ key: "Internal storage", value: "256 GB" }] },
  {
    title: "Processor",
    items: [
      { key: "Name", value: "A19 Pro" },
      { key: "Cores", value: "6-core" },
      { key: "GPU", value: "6-core GPU" },
    ],
  },
  {
    title: "SIM",
    items: [
      { key: "Supported", value: "1 + eSIM" },
      { key: "Form factor", value: "1×SIM" },
      { key: "SIM size", value: "Nano SIM" },
    ],
  },
  {
    title: "Cameras",
    items: [
      { key: "Lenses", value: "3" },
      { key: "Main camera", value: "48 MP Fusion (wide)" },
      { key: "Ultra Wide", value: "48 MP Fusion" },
      { key: "Telephoto", value: "48 MP Fusion, 8× optical zoom" },
      { key: "Front camera", value: "18 MP Center Stage" },
    ],
  },
  {
    title: "Photo & Video",
    items: [
      { key: "Video", value: "4K ProRes, Apple Log 2, genlock" },
      { key: "Slow motion", value: "Yes" },
    ],
  },
  {
    title: "Connectivity",
    items: [
      { key: "Standards", value: "3G, 2G, 4G (LTE), 5G" },
      { key: "Wireless", value: "Bluetooth, Wi-Fi" },
      { key: "WLAN", value: "Wi-Fi 802.11 a/b/g/n/ac/ax/be" },
      { key: "Bluetooth", value: "v5.4" },
      { key: "GPS", value: "Yes" },
      { key: "NFC", value: "Yes" },
      { key: "Biometrics", value: "Face ID" },
      { key: "Protection", value: "IP68" },
    ],
  },
  {
    title: "Power",
    items: [
      { key: "Connector", value: "USB Type-C" },
      { key: "Battery", value: "Built-in, best-ever life" },
      { key: "Fast charging", value: "Yes (50% in 20 min)" },
      { key: "Wireless charging", value: "Yes" },
    ],
  },
  {
    title: "Dimensions",
    items: [
      { key: "Weight", value: "227 g" },
      { key: "Height", value: "163 mm" },
      { key: "Width", value: "77.6 mm" },
      { key: "Depth", value: "8.3 mm" },
    ],
  },
];

const iphone17SpecsRu = (): SpecCategory[] => [
  {
    title: "Общие",
    items: [
      { key: "Производитель", value: "Apple" },
      { key: "Тип", value: "Смартфон" },
      { key: "Серия", value: "Apple iPhone 17 Pro Max" },
      { key: "Конструкция", value: "Титановый корпус" },
      { key: "Управление", value: "Сенсорное" },
      { key: "ОС", value: "iOS" },
    ],
  },
  {
    title: "Экран",
    items: [
      { key: "Диагональ", value: '6.9"' },
      { key: "Разрешение", value: "2796×1290 px" },
      { key: "Тип сенсора", value: "Ёмкостный" },
      { key: "Матрица", value: "Super Retina XDR OLED" },
      { key: "Частота обновления", value: "120 Гц ProMotion" },
      { key: "Особенности", value: "Dynamic Island, Always-On, Ceramic Shield 2" },
    ],
  },
  { title: "Память", items: [{ key: "Внутренняя", value: "256 ГБ" }] },
  {
    title: "Процессор",
    items: [
      { key: "Название", value: "A19 Pro" },
      { key: "Ядра", value: "6" },
      { key: "GPU", value: "6-core GPU" },
    ],
  },
  {
    title: "SIM",
    items: [
      { key: "Поддержка", value: "1 + eSIM" },
      { key: "Форм-фактор", value: "1×SIM" },
      { key: "Размер SIM", value: "Nano SIM" },
    ],
  },
  {
    title: "Камеры",
    items: [
      { key: "Объективы", value: "3" },
      { key: "Основная", value: "48 МП Fusion (wide)" },
      { key: "Сверхширокоугольная", value: "48 МП Fusion" },
      { key: "Телеобъектив", value: "48 МП Fusion, 8× оптический зум" },
      { key: "Фронтальная", value: "18 МП Center Stage" },
    ],
  },
  {
    title: "Фото и видео",
    items: [
      { key: "Видео", value: "4K ProRes, Apple Log 2, genlock" },
      { key: "Замедленная съёмка", value: "Да" },
    ],
  },
  {
    title: "Связь",
    items: [
      { key: "Стандарты", value: "3G, 2G, 4G (LTE), 5G" },
      { key: "Беспроводные", value: "Bluetooth, Wi-Fi" },
      { key: "WLAN", value: "Wi-Fi 802.11 a/b/g/n/ac/ax/be" },
      { key: "Bluetooth", value: "v5.4" },
      { key: "GPS", value: "Да" },
      { key: "NFC", value: "Да" },
      { key: "Биометрия", value: "Face ID" },
      { key: "Защита", value: "IP68" },
    ],
  },
  {
    title: "Питание",
    items: [
      { key: "Разъём", value: "USB Type-C" },
      { key: "Аккумулятор", value: "Встроенный, рекордная автономность" },
      { key: "Быстрая зарядка", value: "Да (50% за 20 мин)" },
      { key: "Беспроводная зарядка", value: "Да" },
    ],
  },
  {
    title: "Размеры",
    items: [
      { key: "Вес", value: "227 г" },
      { key: "Высота", value: "163 мм" },
      { key: "Ширина", value: "77.6 мм" },
      { key: "Глубина", value: "8.3 мм" },
    ],
  },
];

const iphone17SpecsUk = (): SpecCategory[] => [
  {
    title: "Загальні",
    items: [
      { key: "Виробник", value: "Apple" },
      { key: "Тип телефону", value: "Смартфон" },
      { key: "Серія смартфона", value: "Apple iPhone 17 Pro Max" },
      { key: "Тип", value: "Титановий корпус" },
      { key: "Тип управління", value: "Сенсорний" },
      { key: "Операційна система", value: "iOS" },
    ],
  },
  {
    title: "Екран",
    items: [
      { key: "Діагональ екрану", value: '6.9"' },
      { key: "Роздільна здатність", value: "2796×1290 px" },
      { key: "Тип сенсорного екрану", value: "Ємнісний" },
      { key: "Тип матриці", value: "Super Retina XDR OLED" },
      { key: "Частота оновлення", value: "120 Гц ProMotion" },
      { key: "Особливості", value: "Dynamic Island, Always-On, Ceramic Shield 2" },
    ],
  },
  { title: "Пам'ять", items: [{ key: "Внутрішня пам'ять", value: "256 ГБ" }] },
  {
    title: "Процесор",
    items: [
      { key: "Назва процесора", value: "A19 Pro" },
      { key: "Кількість ядер", value: "6-ядерний" },
      { key: "Мобільний GPU", value: "6-core GPU" },
    ],
  },
  {
    title: "SIM",
    items: [
      { key: "Кількість SIM", value: "1 + eSIM" },
      { key: "Формфактор слота", value: "1×SIM" },
      { key: "Розмір SIM", value: "Nano SIM" },
    ],
  },
  {
    title: "Камери",
    items: [
      { key: "Кількість об'єктивів", value: "3" },
      { key: "Основна камера", value: "48 MP Fusion (wide)" },
      { key: "Надширококутна", value: "48 MP Fusion" },
      { key: "Телеоб'єктив", value: "48 MP Fusion, 8× оптичний зум" },
      { key: "Фронтальна камера", value: "18 MP Center Stage" },
    ],
  },
  {
    title: "Фото-відео",
    items: [
      { key: "Відео", value: "4K ProRes, Apple Log 2, genlock" },
      { key: "Уповільнена зйомка", value: "Так" },
    ],
  },
  {
    title: "Технології",
    items: [
      { key: "Стандарт зв'язку", value: "3G, 2G, 4G (LTE), 5G" },
      { key: "Безпровідні", value: "Bluetooth, Wi-Fi" },
      { key: "WLAN", value: "Wi-Fi 802.11 a/b/g/n/ac/ax/be" },
      { key: "Bluetooth", value: "v5.4" },
      { key: "GPS", value: "Так" },
      { key: "NFC", value: "Так" },
      { key: "Біометричний захист", value: "Face ID" },
      { key: "Ступінь захисту", value: "IP68" },
    ],
  },
  {
    title: "Живлення",
    items: [
      { key: "Роз'єм", value: "USB Type-C" },
      { key: "Тип акумулятора", value: "Вбудований, рекордна автономність" },
      { key: "Швидка зарядка", value: "Так (50% за 20 хв)" },
      { key: "Бездротова зарядка", value: "Так" },
    ],
  },
  {
    title: "Фізичні параметри",
    items: [
      { key: "Вага", value: "227 г" },
      { key: "Висота", value: "163 мм" },
      { key: "Ширина", value: "77.6 мм" },
      { key: "Глибина", value: "8.3 мм" },
    ],
  },
];

const iphone17IntroEn = `iPhone 17 Pro Max — the most powerful and advanced Pro model ever. Built with the A19 Pro chip and a revolutionary triple 48MP camera system, it sets new standards for smartphone performance and photography.

A19 Pro chip
Apple's most powerful chip for iPhone. 6-core CPU, 6-core GPU, and 16-core Neural Engine deliver unprecedented performance for demanding apps, gaming, and AI features.

Triple 48MP Fusion cameras
Three 48MP Fusion cameras — Main, Ultra Wide, and Telephoto with 8× optical zoom. Capture professional-quality photos and videos in any conditions. ProRes RAW, Apple Log 2, and genlock for filmmakers.

6.9" Super Retina XDR display
The largest and most advanced iPhone display. 120Hz ProMotion, Dynamic Island, Always-On display, Ceramic Shield 2 for superior durability.

Titanium design
Aerospace-grade titanium frame. Lighter, stronger, more premium. Vapor chamber for enhanced thermal management during intensive tasks.`;

const iphone17IntroRu = `iPhone 17 Pro Max — самый мощный и продвинутый Pro-модель в истории. На базе чипа A19 Pro и революционной тройной 48МП камеры он задаёт новые стандарты производительности и фотографии.

Чип A19 Pro
Самый мощный чип Apple для iPhone. 6-ядерный CPU, 6-ядерный GPU и 16-ядерный Neural Engine обеспечивают беспрецедентную производительность для требовательных приложений, игр и AI.

Тройная 48МП Fusion камера
Три 48МП Fusion камеры — основная, сверхширокоугольная и телеобъектив с 8× оптическим зумом. Снимайте фото и видео профессионального качества в любых условиях. ProRes RAW, Apple Log 2 и genlock для кинематографистов.

6.9" дисплей Super Retina XDR
Самый большой и продвинутый дисплей iPhone. 120 Гц ProMotion, Dynamic Island, Always-On, Ceramic Shield 2 для превосходной прочности.

Титановый дизайн
Рамка из аэрокосмического титана. Легче, прочнее, премиальнее. Парораспределительная камера для улучшенного теплового режима при интенсивных задачах.`;

const iphone17IntroUk = `iPhone 17 Pro Max — найпотужніша та найпередовіша Pro-модель в історії. На базі чіпа A19 Pro та революційної потрійної 48МП камери він задає нові стандарти продуктивності та фотографії.

Чіп A19 Pro
Найпотужніший чіп Apple для iPhone. 6-ядерний CPU, 6-ядерний GPU та 16-ядерний Neural Engine забезпечують безпрецедентну продуктивність для вимогливих застосунків, ігор та AI.

Потрійна 48МП Fusion камера
Три 48МП Fusion камери — основна, надширококутна та телеоб'єктив з 8× оптичним зумом. Знімайте фото та відео професійної якості в будь-яких умовах. ProRes RAW, Apple Log 2 та genlock для кінематографістів.

6.9" дисплей Super Retina XDR
Найбільший та найпередовіший дисплей iPhone. 120 Гц ProMotion, Dynamic Island, Always-On, Ceramic Shield 2 для чудової міцності.

Титановий дизайн
Рамка з аерокосмічного титану. Легший, міцніший, преміальніший. Паророзподільна камера для покращеного теплового режиму при інтенсивних задачах.`;

function getIphone15Content(storage: string) {
  return {
    en: {
      intro: iphone15IntroEn,
      specs: iphone15SpecsEn(storage),
      note: noteEn,
    },
    ru: {
      intro: iphone15IntroRu,
      specs: iphone15SpecsRu(storage),
      note: noteRu,
    },
    uk: {
      intro: iphone15IntroUk,
      specs: iphone15SpecsUk(storage),
      note: noteUk,
    },
  };
}

function getIphone16Content(storage: string) {
  return {
    en: {
      intro: iphone16IntroEn,
      specs: iphone16SpecsEn(storage),
      note: noteEn,
    },
    ru: {
      intro: iphone16IntroRu,
      specs: iphone16SpecsRu(storage),
      note: noteRu,
    },
    uk: {
      intro: iphone16IntroUk,
      specs: iphone16SpecsUk(storage),
      note: noteUk,
    },
  };
}

function getIphone17Content() {
  return {
    en: {
      intro: iphone17IntroEn,
      specs: iphone17SpecsEn(),
      note: noteEn,
    },
    ru: {
      intro: iphone17IntroRu,
      specs: iphone17SpecsRu(),
      note: noteRu,
    },
    uk: {
      intro: iphone17IntroUk,
      specs: iphone17SpecsUk(),
      note: noteUk,
    },
  };
}

export function getProductContent(
  locale: Locale,
  slug: string,
  storage?: string
): ProductContent | null {
  const bySlug: Record<string, Record<Locale, ProductContent>> = {
    "iphone-14-pro-max-128gb-space-black": getIphone14ProMaxContent("128 GB"),
    "iphone-15-128gb-black": getIphone15Content("128 GB"),
    "iphone-15-256gb-blue": getIphone15Content("256 GB"),
    "iphone-16-128gb-white": getIphone16Content("128 GB"),
    "iphone-16-256gb-black": getIphone16Content("256 GB"),
    "iphone-17-256gb-titanium": getIphone17Content(),
  };
  return bySlug[slug]?.[locale] ?? null;
}
