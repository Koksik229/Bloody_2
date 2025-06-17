# Разработка проекта

## 1. Основные компоненты системы

### 1.1 Профиль пользователя (Profile)
- **Profile → Location**
  - Текущая локация персонажа
  - История перемещений
  - Ограничения на перемещение
- **Profile → Race**
  - Выбор расы при создании
  - Бонусы и особенности расы
  - Внешний вид персонажа
- **Profile → Characteristics**
  - Базовые характеристики
  - Вторичные характеристики
  - Модификаторы от расы

### 1.2 Характеристики (Characteristics)
- **Characteristics → Profile**
  - Базовые характеристики (сила, ловкость, интеллект)
  - Вторичные характеристики (здоровье, мана, уклонение)
  - Модификаторы от расы и класса
  - Система HP/MP:
    - Максимальное и текущее здоровье
    - Максимальная и текущая мана
    - Регенерация HP/MP
    - Бонусы к HP/MP от характеристик
    - Эффекты, влияющие на HP/MP
  - Система статов:
    - Базовые значения
    - Бонусы от снаряжения
    - Временные модификаторы
    - Специальные эффекты

### 1.3 Предметы (Items)
- **Items → Profile**
  - Система экипировки
  - Управление инвентарем
  - Механика использования предметов
- **Items → Characteristics**
  - Влияние на характеристики
  - Требования к использованию
  - Специальные эффекты
- **Items → Locations**
  - Взаимодействие с игровым миром
  - Ограничения использования
  - Условия применения

### 1.4 Локации (Locations)
- **Locations → Profile**
  - Текущее положение
  - Доступные действия
  - Ограничения перемещения
- **Locations → Items**
  - Предметы в локации
  - Взаимодействие с предметами
  - Условия использования

### 1.5 Система уровней и прогрессии
- **Level → Experience**
  - Требования к опыту для каждого уровня
  - Система AP (Action Points)
  - Прогрессия персонажа
- **Level → Profile**
  - Текущий уровень
  - Накопленный опыт
  - Доступные способности

### 1.6 Система безопасности
- **Login → User**
  - Логирование входов
  - Отслеживание попыток входа
  - Временные метки активности
- **User → Profile**
  - Привязка профиля к аккаунту
  - Управление доступом
  - Настройки безопасности

## 2. Технические особенности

### 2.1 Архитектура
- Модульная структура
- REST API для основных операций
- WebSocket для real-time функций
- Система кэширования для оптимизации

### 2.2 Безопасность
- Шифрование данных
- Защита от SQL-инъекций
- Валидация входных данных
- Система логирования действий

### 2.3 Оптимизация
- Кэширование частых запросов
- Оптимизация запросов к БД
- Асинхронная обработка задач
- Эффективное использование ресурсов

## Обзор проекта
Это игровой проект с фронтендом и бэкендом, реализующий ролевую игру с профилями пользователей, локациями, расами и чатом.

### Структура проекта
- `/frontend` - Фронтенд приложение
- `/backend` - Бэкенд сервисы
  - `/models` - Модели базы данных
  - `/routes` - API эндпоинты
  - `/services` - Бизнес-логика
  - `/schemas` - Схемы валидации данных
  - `/utils` - Вспомогательные функции
  - `/migrations` - Миграции базы данных

## Архитектура системы

### Модели базы данных

#### Система пользователей
- **Модель User**
  - Основные поля: id, username, email, nickname, password
  - Игровые поля: level, experience, race_id, location_id
  - Отслеживание: created_at, last_login, last_seen, is_active
  - Связи: race, location, skills, chat messages

#### Система локаций
- **Модель Location**
  - Основные поля: id, name, description, background
  - Связь с типом локации
  - Двунаправленные связи между локациями
  - Отслеживание пользователей в локациях

- **Модель LocationLink**
  - Управление связями между локациями
  - Поддержка состояния блокировки
  - Двунаправленные связи

- **Модель LocationType**
  - Категоризация локаций
  - Содержит название и описание

#### Система рас
- **Модель Race**
  - Основные атрибуты: name, description
  - Базовые характеристики: strength, agility, power, intuition
  - Боевые навыки: weapon_skill, parry, shield_block
  - Отслеживание прогрессии уровней

- **Модель RaceLevelStat**
  - Отслеживание прироста HP и MP по уровням
  - Специфичная для рас прогрессия

## Документация API эндпоинтов

### Эндпоинты аутентификации (`/auth`)
1. **POST /register**
   - Назначение: Регистрация пользователя
   - Параметры:
     - username: string (form)
     - password: string (form)
     - confirm_password: string (form)
     - email: string (form)
     - nickname: string (form)
   - Валидации:
     - Формат email
     - Сложность пароля
     - Формат имени пользователя
     - Формат никнейма
   - Ответ: 
     - Успех: `{"message": "Регистрация успешна", "nickname": string}`
     - Ошибка: 400 при ошибках валидации

2. **POST /login**
   - Назначение: Аутентификация пользователя
   - Параметры:
     - username: string (form)
     - password: string (form)
   - Ответ:
     - Успех: Статистика пользователя и игровое состояние
     - Ошибка: 401 при неверных учетных данных

3. **POST /logout**
   - Назначение: Выход пользователя
   - Ответ: `{"message": "Вы вышли"}`

### Эндпоинты профиля
1. **GET /me**
   - Назначение: Получение профиля текущего пользователя
   - Аутентификация: Требуется
   - Ответ: Полный профиль пользователя, включая:
     - Основную информацию (id, username, nickname)
     - Уровень и опыт
     - Информацию о расе
     - Текущую локацию
     - Характеристики и навыки
     - Доступные очки
     - Доступные локации

### Эндпоинты локаций (`/location`)
1. **GET /{location_id}**
   - Назначение: Получение информации о локации
   - Параметры:
     - location_id: integer (path)
   - Ответ:
     - Детали локации (id, name, description, background)
     - Доступные переходы (связанные локации)
   - Ошибка: 404 если локация не найдена

2. **POST /move**
   - Назначение: Перемещение пользователя в новую локацию
   - Аутентификация: Требуется
   - Параметры:
     - location_id: integer (body)
   - Валидации:
     - Валидная связь между локациями
     - Связь не заблокирована
   - Ответ: `{"status": "ok", "new_location": integer}`
   - Ошибка: 400 при недопустимых переходах

### Система чата (WebSocket)
1. **WebSocket /ws/chat**
   - Назначение: Обмен сообщениями в реальном времени
   - Аутентификация: Требуется
   - Возможности:
     - Глобальные сообщения чата
     - Приватные сообщения
     - Отслеживание онлайн пользователей
     - История сообщений (последние 100)
   - Типы сообщений:
     - "global": Рассылка всем пользователям
     - "private": Прямое сообщение конкретному пользователю
   - События:
     - Установление соединения
     - Получение сообщения
     - Статус пользователя онлайн/оффлайн
     - Уведомления об ошибках

### Связи между эндпоинтами
1. **Аутентификация → Профиль**
   - При регистрации создается базовый профиль с:
     - Начальной расой (ID: 1)
     - Стартовой локацией (ID: 1)
     - Базовыми характеристиками из расы
     - Начальными очками (5 атрибутов, 2 навыка)
   - При входе создается сессия, необходимая для доступа к профилю
   - Обновляется last_login в профиле

2. **Профиль → Локации**
   - Профиль содержит:
     - Текущую локацию (location_id)
     - Список доступных локаций (available_locations)
   - При перемещении:
     - Проверяется валидность перехода
     - Обновляется location_id в профиле
     - Пересчитываются доступные локации
   - Доступные локации зависят от:
     - Текущего местоположения
     - Состояния связей (is_locked)

3. **Чат → Профиль**
   - Использует данные из профиля:
     - Никнейм для отображения
     - ID для идентификации
   - Обновляет статус онлайн/оффлайн в профиле
   - Приватные сообщения используют никнейм из профиля
   - При отключении обновляет is_online в профиле

4. **Локации → Профиль**
   - Перемещение между локациями обновляет location_id в профиле
   - Доступные переходы зависят от текущей локации
   - Проверка валидности переходов перед перемещением

5. **Раса → Профиль**
   - При создании профиля:
     - Устанавливаются базовые характеристики из расы
     - Создаются начальные навыки на основе расовых параметров
   - Влияет на:
     - Базовые атрибуты (strength, agility, power, intuition)
     - Боевые навыки (weapon_skill, parry, shield_block)
     - Прогрессию уровней (hp_gain, mp_gain)

6. **Навыки → Профиль**
   - Хранят все характеристики персонажа:
     - Атрибуты (strength, agility, power, intuition)
     - Боевые навыки (weapon_skill, parry, shield_block)
   - Управляют очками для распределения:
     - available_attribute_points (обычные очки)
     - available_attribute_points_special (специальные очки)
   - Обновляются при:
     - Распределении очков
     - Изменении характеристик
     - Прокачке навыков

7. **Уровень → Профиль**
   - Влияет на:
     - Доступные очки для распределения
     - Прирост HP и MP (через RaceLevelStat)
     - Доступ к контенту
   - Обновляется при:
     - Получении опыта
     - Достижении порога уровня

8. **Сообщения чата → Профиль**
   - Двунаправленная связь:
     - Отправленные сообщения (sent_messages)
     - Полученные сообщения (received_messages)
   - Хранит:
     - Тип сообщения (global/private/direct)
     - Статус прочтения
     - Временную метку
   - Использует данные профиля:
     - ID отправителя/получателя
     - Никнеймы для отображения

9. **Прогрессия уровней → Профиль**
   - Определяет:
     - Необходимый опыт для уровня
     - Доступные очки атрибутов (AP)
   - Влияет на:
     - Разблокировку контента
     - Развитие персонажа
   - Обновляется при:
     - Достижении нового уровня
     - Изменении требований к уровню

10. **Логи → Аутентификация**
    - Отслеживает:
      - Попытки входа
      - Успешность аутентификации
      - Временные метки
    - Используется для:
      - Анализа безопасности
      - Отслеживания подозрительной активности
      - Аудита системы

11. **Профиль → Все компоненты**
    - Центральный узел системы:
      - Содержит ссылки на все связанные сущности
      - Обеспечивает целостность данных
      - Синхронизирует состояние
    - Взаимодействует с:
      - Аутентификацией (сессии, логи)
      - Локациями (текущее положение)
      - Расами (характеристики)
      - Навыками (развитие)
      - Чатом (коммуникация)
      - Уровнями (прогрессия)

12. **Предметы → Профиль**
    - Система экипировки:
      - Связь с пользователем (user_id)
      - Слоты для предметов (slot)
      - Шаблоны предметов (item_template_id)
    - Система инвентаря:
      - Хранение предметов
      - Количество предметов (quantity)
      - Связь с пользователем
    - Взаимодействие:
      - Экипировка/снятие предметов
      - Управление инвентарем
      - Проверка доступных слотов

13. **Предметы → Характеристики**
    - Влияние на:
      - Боевые характеристики
      - Защитные параметры
      - Специальные способности
    - Требования:
      - Уровень персонажа
      - Характеристики
      - Раса/класс

14. **Предметы → Локации**
    - Возможные взаимодействия:
      - Нахождение предметов
      - Торговля
      - Квестовые предметы
    - Ограничения:
      - Доступность в локациях
      - Условия получения
      - Ограничения по использованию

### Безопасность и валидация
- Все защищенные эндпоинты проверяют валидность сессии
- Валидация входных данных на всех эндпоинтах
- Ограничение частоты запросов (в разработке)
- CORS защита для фронтенда
- Принудительное использование HTTPS
- Безопасные настройки cookie

### Обработка ошибок
- 400: Неверный запрос (неверные входные данные)
- 401: Не авторизован (отсутствует/неверная сессия)
- 404: Не найдено (ресурс не существует)
- 500: Внутренняя ошибка сервера

## Журнал разработки

### [Текущая дата]
- Завершен полный анализ бэкенда
- Документирована архитектура системы
- Определены ключевые компоненты и их взаимосвязи

## Важные решения
1. Использование FastAPI для бэкенда
2. SQLAlchemy для ORM
3. WebSocket для чата в реальном времени
4. Аутентификация на основе сессий
5. Модульная архитектура с четким разделением ответственности

## Ожидающие задачи
1. Проверка и оптимизация запросов к базе данных
2. Реализация комплексной обработки ошибок
3. Добавление ограничения частоты запросов для API эндпоинтов
4. Улучшение мер безопасности
5. Реализация системы кэширования

## Примечания
- Система спроектирована для масштабирования
- Четкое разделение между игровой логикой и инфраструктурой
- Функции реального времени реализованы через WebSocket
- Модульный дизайн позволяет легко добавлять новые функции

### 7. Система уровней и прогрессии
- **Level → Experience**
  - Требования к опыту для каждого уровня
  - Система AP (Action Points)
  - Прогрессия персонажа

### 8. Система безопасности
- **Login → User**
  - Логирование входов
  - Отслеживание попыток входа
  - Временные метки активности

### 9. Пользовательская система
- **User → Race**
  - Выбор расы при создании
  - Характеристики расы
- **User → Location**
  - Текущая локация
  - История перемещений
- **User → Level**
  - Система уровней
  - Накопление опыта
  - Прогрессия персонажа

### 2. Характеристики (Characteristics)
- **Characteristics → Profile**
  - Базовые характеристики (сила, ловкость, интеллект и т.д.)
  - Вторичные характеристики (здоровье, мана, уклонение и т.д.)
  - Модификаторы от расы и класса
  - Система HP/MP:
    - Максимальное и текущее здоровье
    - Максимальная и текущая мана
    - Регенерация HP/MP
    - Бонусы к HP/MP от характеристик
    - Эффекты, влияющие на HP/MP
  - Система статов:
    - Базовые значения
    - Бонусы от снаряжения
    - Временные модификаторы
    - Специальные эффекты

## 3. Frontend архитектура

### 3.1 Основные компоненты
- **GameScreen**
  - Корневой компонент игрового интерфейса
  - Управление расположением компонентов
  - Отрисовка фона локации
  - Интеграция всех UI элементов
  - Композиция компонентов:
    - TopMenu (верхнее меню)
    - PlayerHUD (информация о персонаже)
    - LocationView (отображение локации)
  - Обработка состояния загрузки

- **PlayerHUD**
  - Отображение информации о персонаже
  - Система HP/MP баров:
    - Динамическое изменение цвета HP
    - Процентное отображение значений
    - Визуальная индикация состояния
    - Адаптивная высота баров
    - Плавные анимации изменений
  - Отображение никнейма
  - Информационная иконка
  - Стилизация:
    - Вертикальные бары здоровья и маны
    - Цветовая индикация состояния
    - Адаптивный дизайн
    - Анимации при изменении значений

- **LocationView**
  - Отображение текущей локации
  - Система навигации:
    - Кнопки перехода между локациями
    - Обработка перемещений
    - Обновление состояния
    - Валидация доступных переходов
  - Отображение описания локации
  - Стилизация:
    - Карточка локации
    - Анимированные кнопки
    - Адаптивная верстка
    - Визуальная обратная связь

- **TopMenu**
  - Доступ к основным функциям:
    - Инвентарь
    - Навыки
    - Почта
    - Друзья
    - Настройки
  - Стилизация:
    - Фиксированное позиционирование
    - Иконки с подсказками
    - Анимации при наведении
    - Адаптивное меню

### 3.2 Система состояний
- **AuthContext**
  - Управление состоянием пользователя:
    - Данные профиля
    - Текущая локация
    - HP/MP значения
    - Уровень персонажа
  - Хранение данных персонажа
  - Обновление UI при изменениях
  - Обработка авторизации:
    - Автоматическая проверка сессии
    - Обработка выхода
    - Обработка ошибок
  - Типизация данных:
    - UserData интерфейс
    - AuthContextType
    - Строгая типизация пропсов

### 3.3 Стилизация
- **Модульные CSS файлы**
  - PlayerHUD.css:
    - Стили баров HP/MP
    - Анимации изменений
    - Адаптивный дизайн
  - LocationView.css:
    - Стили карточки локации
    - Анимации кнопок
    - Адаптивная верстка
  - GameScreen.css:
    - Компоновка компонентов
    - Стили фона
    - Адаптивная сетка
  - Login.css:
    - Стили форм
    - Анимации входа
    - Адаптивный дизайн
  - index.css:
    - Глобальные стили
    - Сброс стилей
    - Общие утилиты

- **Адаптивный дизайн**
  - Медиа-запросы
  - Гибкая сетка
  - Отзывчивые компоненты
  - Мобильная оптимизация

- **Анимации и переходы**
  - Плавные изменения состояний
  - Анимации загрузки
  - Переходы между экранами
  - Визуальная обратная связь

### 3.4 Взаимодействие с Backend
- **REST API интеграция**
  - Эндпоинты:
    - /me (получение данных пользователя)
    - /move (перемещение между локациями)
    - /logout (выход из системы)
  - Обработка ответов
  - Обработка ошибок
  - Типизация запросов

- **WebSocket для real-time обновлений**
  - Обновление HP/MP
  - Обновление локации
  - Чат
  - Уведомления

- **Обработка ошибок**
  - Валидация данных
  - Обработка сетевых ошибок
  - Пользовательские уведомления
  - Восстановление после ошибок

- **Кэширование данных**
  - Локальное хранение
  - Оптимизация запросов
  - Синхронизация состояния
  - Офлайн-режим

### 3.5 Оптимизация
- **Ленивая загрузка компонентов**
  - Разделение кода
  - Динамические импорты
  - Оптимизация начальной загрузки
  - Кэширование компонентов

- **Мемоизация вычислений**
  - Кэширование результатов
  - Оптимизация рендеринга
  - Управление зависимостями
  - Производительность вычислений

- **Оптимизация ререндеров**
  - useMemo для вычислений
  - useCallback для функций
  - React.memo для компонентов
  - Контроль обновлений

- **Эффективное управление состоянием**
  - Централизованное хранение
  - Оптимизация обновлений
  - Предотвращение утечек
  - Очистка ресурсов

### 3.6 Типизация и безопасность
- **TypeScript интеграция**
  - Строгая типизация
  - Интерфейсы компонентов
  - Типы данных
  - Проверка типов

- **Безопасность**
  - Валидация входных данных
  - Защита от XSS
  - Безопасные запросы
  - Управление сессиями

### 3.7 Примеры реализации ключевых компонентов

#### PlayerHUD Component
```typescript
// Пример реализации PlayerHUD с HP/MP барами
export default function PlayerHUD() {
  const { user } = useAuth();
  
  // Расчет процентов для баров
  const hpPercent = Math.min(100, Math.max(0, (user.hp / 100) * 100));
  const mpPercent = Math.min(100, Math.max(0, (user.mp / 100) * 100));
  
  // Динамический цвет HP бара
  const getHpBarColor = () => {
    if (hpPercent > 60) return '#00cc00';
    if (hpPercent > 30) return '#cccc00';
    return '#cc0000';
  };

  return (
    <div className="player-hud">
      <div className="nickname-row">
        <span className="nickname">{user.nickname}</span>
        <span className="info-icon">[i]</span>
      </div>
      <div className="bars-container">
        <div className="bar-container">
          <div className="bar-outer hp-bar">
            <div
              className="bar-inner"
              style={{ 
                height: `${hpPercent}%`,
                backgroundColor: getHpBarColor()
              }}
            />
          </div>
          <div className="bar-value">{user.hp}</div>
        </div>
        {/* MP Bar аналогично */}
      </div>
    </div>
  );
}
```

#### LocationView Component
```typescript
// Пример реализации LocationView с навигацией
const LocationView: React.FC = () => {
  const { user, setUser } = useAuth();

  const handleMove = async (locationId: number) => {
    try {
      const res = await fetch(`${API}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ location_id: locationId })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Ошибка при переходе:", error);
    }
  };

  return (
    <div className="location-view">
      <h2>{user.location_name}</h2>
      <p>{user.location_desc}</p>
      <div className="move-buttons">
        {user.available_moves?.map((move) => (
          <button key={move.id} onClick={() => handleMove(move.id)}>
            Перейти в {move.name}
          </button>
        ))}
      </div>
    </div>
  );
};
```

#### AuthContext Implementation
```typescript
// Пример реализации AuthContext
interface UserData {
  nickname: string;
  level: number;
  location_id: number;
  hp: number;
  mp: number;
}

interface AuthContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  logout: () => void;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API}/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3.8 Расширенные системы

#### Система HP/MP
- **Механика регенерации**:
  ```typescript
  // Пример системы регенерации
  const regenerateStats = () => {
    if (user.hp < user.maxHp) {
      const hpRegen = calculateHpRegen(user);
      setUser(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + hpRegen)
      }));
    }
    if (user.mp < user.maxMp) {
      const mpRegen = calculateMpRegen(user);
      setUser(prev => ({
        ...prev,
        mp: Math.min(prev.maxMp, prev.mp + mpRegen)
      }));
    }
  };
  ```

#### Система навигации
- **Валидация перемещений**:
  ```typescript
  // Пример валидации перемещений
  const validateMove = (locationId: number) => {
    const currentLocation = user.location_id;
    const availableMoves = user.available_moves;
    
    return availableMoves.some(move => 
      move.id === locationId && 
      validateRequirements(move.requirements)
    );
  };
  ```

### 3.9 Тестирование

#### Unit тесты
```typescript
// Пример теста для PlayerHUD
describe('PlayerHUD', () => {
  it('renders HP bar correctly', () => {
    const { getByText } = render(
      <AuthProvider>
        <PlayerHUD />
      </AuthProvider>
    );
    
    expect(getByText('100')).toBeInTheDocument();
  });

  it('changes HP bar color based on value', () => {
    const { container } = render(
      <AuthProvider>
        <PlayerHUD />
      </AuthProvider>
    );
    
    const hpBar = container.querySelector('.hp-bar');
    expect(hpBar).toHaveStyle({ backgroundColor: '#00cc00' });
  });
});
```

#### Интеграционные тесты
```typescript
// Пример интеграционного теста
describe('Location Navigation', () => {
  it('allows valid movement between locations', async () => {
    const { getByText } = render(
      <AuthProvider>
        <LocationView />
      </AuthProvider>
    );
    
    const moveButton = getByText('Перейти в Лес');
    await userEvent.click(moveButton);
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/move'),
      expect.any(Object)
    );
  });
});
```

#### E2E тесты
```typescript
// Пример E2E теста
describe('Game Flow', () => {
  it('completes full game cycle', async () => {
    await page.goto('/');
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveSelector('.player-hud');
    await expect(page).toHaveSelector('.location-view');
    
    const hpBar = await page.$('.hp-bar');
    expect(await hpBar.evaluate(el => el.style.height)).toBe('100%');
  });
});
```

#### Тестирование производительности
```typescript
// Пример теста производительности
describe('Performance', () => {
  it('renders components within acceptable time', () => {
    const start = performance.now();
    render(<GameScreen />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100);
  });

  it('handles state updates efficiently', () => {
    const { rerender } = render(<PlayerHUD />);
    const updates = [];
    
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      rerender(<PlayerHUD hp={i} />);
      updates.push(performance.now() - start);
    }
    
    const averageUpdateTime = updates.reduce((a, b) => a + b) / updates.length;
    expect(averageUpdateTime).toBeLessThan(16); // 60fps
  });
});
```

### 3.10 Инструменты тестирования
- **Jest** для unit и интеграционных тестов
- **React Testing Library** для тестирования компонентов
- **Cypress** для E2E тестов
- **Lighthouse** для тестирования производительности
- **ESLint** для статического анализа кода
- **TypeScript** для проверки типов 

## 4. Структура базы данных (SQLite)

### 4.1 Полный список таблиц
1. users
2. locations
3. location_links
4. location_types
5. races
6. race_level_stats
7. skills
8. chat_messages
9. level_progression
10. login_logs
11. sqlite_sequence (системная таблица)

### 4.2 Схемы таблиц

#### Users
```sql
CREATE TABLE users (
    id INTEGER NOT NULL,
    username VARCHAR,
    email VARCHAR,
    nickname VARCHAR,
    race_id INTEGER,
    location_id INTEGER,
    created_at DATETIME,
    last_login DATETIME,
    last_seen DATETIME,
    is_active BOOLEAN,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY(race_id) REFERENCES races (id),
    FOREIGN KEY(location_id) REFERENCES locations (id)
);
```

#### Locations
```sql
CREATE TABLE locations (
    id INTEGER NOT NULL,
    name VARCHAR,
    description TEXT,
    background VARCHAR,
    type_id INTEGER,
    PRIMARY KEY (id)
);
```

#### LocationLinks
```sql
CREATE TABLE location_links (
    id INTEGER NOT NULL,
    from_id INTEGER,
    to_id INTEGER,
    is_locked BOOLEAN,
    PRIMARY KEY (id),
    FOREIGN KEY(from_id) REFERENCES locations (id),
    FOREIGN KEY(to_id) REFERENCES locations (id)
);
```

#### LocationTypes
```sql
CREATE TABLE location_types (
    id INTEGER NOT NULL,
    name VARCHAR,
    description TEXT,
    PRIMARY KEY (id)
);
CREATE INDEX ix_location_types_id ON location_types (id);
```

#### Races
```sql
CREATE TABLE races (
    id INTEGER NOT NULL,
    name VARCHAR,
    description TEXT,
    base_strength INTEGER DEFAULT 10,
    base_agility INTEGER DEFAULT 10,
    base_power INTEGER DEFAULT 10,
    base_intuition INTEGER DEFAULT 10,
    base_weapon_skill INTEGER DEFAULT 5,
    base_parry INTEGER DEFAULT 5,
    base_shield_block INTEGER DEFAULT 5,
    PRIMARY KEY (id)
);
```

#### RaceLevelStats
```sql
CREATE TABLE race_level_stats (
    id INTEGER NOT NULL,
    race_id INTEGER,
    level INTEGER,
    hp_gain INTEGER,
    mp_gain INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY(race_id) REFERENCES races (id)
);
```

#### Skills
```sql
CREATE TABLE skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    strength INTEGER DEFAULT 0,
    agility INTEGER DEFAULT 0,
    power INTEGER DEFAULT 0,
    parry INTEGER DEFAULT 0,
    weapon_skill INTEGER DEFAULT 0,
    shield_block INTEGER DEFAULT 0,
    intuition INTEGER DEFAULT 0,
    available_attribute_points INTEGER DEFAULT 0,
    available_attribute_points_special INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
```

#### ChatMessages
```sql
CREATE TABLE chat_messages (
    id INTEGER NOT NULL,
    sender_id INTEGER,
    receiver_id INTEGER,
    message_type VARCHAR(7),
    content VARCHAR,
    created_at DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY(sender_id) REFERENCES users (id),
    FOREIGN KEY(receiver_id) REFERENCES users (id)
);
```

#### LoginLogs
```sql
CREATE TABLE login_logs (
    id INTEGER NOT NULL,
    username VARCHAR,
    success BOOLEAN,
    timestamp DATETIME,
    PRIMARY KEY (id)
);
```

### 4.3 Связи между таблицами
- **Users → Races**: race_id в users ссылается на id в races
- **Users → Locations**: location_id в users ссылается на id в locations
- **Locations → LocationTypes**: type_id в locations ссылается на id в location_types
- **LocationLinks**: связывает locations через from_id и to_id
- **RaceLevelStats → Races**: race_id ссылается на id в races
- **Skills → Users**: user_id ссылается на id в users
- **ChatMessages → Users**: sender_id и receiver_id ссылаются на id в users

### 4.4 Особенности реализации
- Использование SQLite как легковесной БД
- Автоматические значения по умолчанию для базовых характеристик
- Временные метки для отслеживания активности
- Текстовые поля для описаний и сообщений
- Целочисленные идентификаторы для связей
- Индексы для оптимизации запросов
- Внешние ключи для обеспечения целостности данных 