import { Events, Menu, LocalPlayer, GameState, EventsSDK, ImageData } from 'github.com/octarine-public/wrapper/index'
// Уровни логирования
// logging.ts

// Уровни (меньше число — подробнее лог, как в оригинале)
export enum LogLevel {
    DEBUG = 10,
    INFO = 20,
    WARN = 30,
    ERROR = 40,
    CRITICAL = 50,
    UNKNOWN = 60,
}

type LevelKey = keyof typeof LogLevel;

interface Logger {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    critical(message: string): void;
    unknown(message: string): void;
    setLevel(level: LogLevel | LevelKey | number): void;
    getLevel(): LogLevel;
}

export const logging: Logger = (() => {
    let loggingLevel: LogLevel = LogLevel.DEBUG;

    const styles: Record<number, { text: string; css: string }> = {
        [LogLevel.DEBUG]:    { text: "DEBUG", css: "color: lightgray;" },
        [LogLevel.INFO]:     { text: "INFO",  css: "color: blue;" },
        [LogLevel.WARN]:     { text: "WARN",  css: "color: orange;" },
        [LogLevel.ERROR]:    { text: "ERROR", css: "color: red;" },
        [LogLevel.CRITICAL]: { text: "CRIT",  css: "color: darkred;" },
        [LogLevel.UNKNOWN]:  { text: "UNKWN", css: "color: gray;" },
    };

    const timeStyle = "color: gray; font-weight: bold";
    const sepStyle  = "font-weight: normal; color: white;";

    function isLogLevel(n: number): n is LogLevel {
        return (
            n === LogLevel.DEBUG ||
            n === LogLevel.INFO ||
            n === LogLevel.WARN ||
            n === LogLevel.ERROR ||
            n === LogLevel.CRITICAL ||
            n === LogLevel.UNKNOWN
        );
    }

    function normalizeLevel(level: LogLevel | LevelKey | number): LogLevel {
        if (typeof level === "number") {
            if (isLogLevel(level)) return level;
            throw new Error("Invalid numeric level");
        }
        if (typeof level === "string") {
            const val = (LogLevel as any)[level]; // keyof enum → number
            if (typeof val === "number" && isLogLevel(val)) return val;
            throw new Error("Invalid string level");
        }
        return level; // already LogLevel
    }

    function sendLog(status: LogLevel, message: string): void {
        // фильтр по уровню
        if (loggingLevel > status) return;

        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");

        const { text, css } = styles[status] ?? styles[LogLevel.UNKNOWN];
        const timestamp = `${hh}:${mm}:${ss}`;
        const formattedStatus = `[${text}]`.padEnd(7, " ");

        // Примечание: стили %c работают в DevTools (Chromium). В обычном Node-консоли — без стилей.
        console.log(
            `%c${timestamp}%c | %c${formattedStatus}%c | ${message}`,
            timeStyle,
            sepStyle,
            css,
            sepStyle
        );
    }

    return {
        debug:   (m: string) => sendLog(LogLevel.DEBUG, m),
        info:    (m: string) => sendLog(LogLevel.INFO, m),
        warn:    (m: string) => sendLog(LogLevel.WARN, m),
        error:   (m: string) => sendLog(LogLevel.ERROR, m),
        critical:(m: string) => sendLog(LogLevel.CRITICAL, m),
        unknown: (m: string) => sendLog(LogLevel.UNKNOWN, m),
        setLevel(level: LogLevel | LevelKey | number) {
            try {
                loggingLevel = normalizeLevel(level);
            } catch (e) {
                console.warn("Некорректный уровень логирования:", level);
            }
        },
        getLevel() {
            return loggingLevel;
        },
    };
})();

// === Пример использования ===
logging.setLevel(LogLevel.DEBUG);
// logging.setLevel("CRITICAL"); // также работает
// logging.setLevel(30);         // и так тоже (WARN)

logging.debug("Это сообщение для отладки");
logging.info("Это информационное сообщение");
logging.warn("Это предупреждение");
logging.error("Это сообщение об ошибке");
logging.critical("Это критическая ошибка");
logging.unknown("Это неизвестный статус");


const customGamesEntry = Menu.AddEntry('Custom Games HAX', ImageData.Icons.icon_svg_keyboard)
let customGameNode: Menu.Node | null = null
customGamesEntry.AddShortDescription('Supported Games', '', 0,ImageData.Icons.transfer_arrow_png)
customGameNode = customGamesEntry.AddNode('SpinTD', ImageData.Icons.gold_large, 'Inject SpinTD features into the game')

EventsSDK.on('GameStarted', () => {
    switch (GameState.AddonName) {
        case '2860562213': {

            logging.debug("Запуск скрипта для SpinTD")
            customGameNode = customGamesEntry.AddNode('SpinTD', ImageData.Icons.gold_large, 'Inject SpinTD features into the game')
            const goldSlider = customGameNode.AddSlider('Gold amount', 0, 0, 500, 0, 'Amount of gold to give', 1)
            const giveGoldButton = customGameNode.AddButton('Give gold', 'Give gold to yourself', 1)

            giveGoldButton.OnValue(() => {

                const gold = goldSlider.value

                CustomGameEvents.FireEventToServer('DebugAddGold', new Map<string, any>(Object.entries({
                    player_id: LocalPlayer!.PlayerID,
                    gold_number: gold
                })))
                logging.info("Выдано золото: " + gold + " для игрока ID: " + LocalPlayer!.PlayerID)
            })

            const allowBuy = customGameNode.AddToggle('Debug Buy', false, 'Ability of giving items from store for free', 2)

            allowBuy.OnValue(() => {
                CustomGameEvents.FireEventToServer('EnableDebugBuy', new Map<string, any>(Object.entries({
                    player_id: LocalPlayer!.PlayerID,
                    debug_buy: allowBuy.value ? 1 : 0
                })))
                logging.info("Debug Buy установлено в: " + (allowBuy.value ? "ВКЛ" : "ВЫКЛ") + " для игрока ID: " + LocalPlayer!.PlayerID)
            })
            const grimStrokeShopButton = customGameNode.AddButton('Grim Stroke Shop', 'Open Grim Stroke Shop', 3)
            grimStrokeShopButton.OnValue(() => {
                CustomGameEvents.FireEventToServer('DebugShowGrimshop', new Map<string, any>(Object.entries({
                    level: 1,
                })))
                logging.info("Открыт магазин Grim Stroke для игрока ID: " + LocalPlayer!.PlayerID)
            });

            const bossItemsListArray = 	[
                "item_butchers_cleaver_custom",      // Pudge+
                "item_roshan_banner_custom",         // Roshan+
                "item_ice_shard_custom",             // Lich+
                "item_phoenix_ash_custom",           // Phoenix+
                "item_coins_of_duplicity_custom",    // Slark+
                "item_ensnare_custom",               // Fish Fex+
                "item_chakram_custom",               // Timbersaw
                "item_void_clock_custom",            // Faceless Void+
                "item_pelt_of_the_old_wolf_custom",  // Lycan+
                "item_forbidden_fruit_custom",       // Treant Protector
                "item_flicker_custom",               // Nyx+
                "item_paw_of_undying_custom",        // Undying+
                "item_smoke_dagger_custom",          // Dark Seer
                "item_fragment_tower_light_custom",  // Silenser
                "item_lost_soul_custom",             // Elder Titan+
                "item_piece_stone_giant_custom",     // Tiny+
                "item_amulet_night_custom",          // Night Stalker
            ]
            const getBossItemsDropdown = customGameNode.AddDropdown("",bossItemsListArray);
            const getBossItemButton = customGameNode.AddButton("GIVE BOSS ITEM")
            getBossItemButton.OnValue(() => {
                const selectedItemName = bossItemsListArray[getBossItemsDropdown.ConfigValue]
                CustomGameEvents.FireEventToServer('GiveItemDebug', new Map<string, any>(Object.entries({
                    player_id: LocalPlayer!.PlayerID,
                    item_name: selectedItemName,
                })))
                logging.info("Выдан предмет: " + selectedItemName + " для игрока ID: " + LocalPlayer!.PlayerID)
            });
            break
        }

        default: {
            break
        }
    }
})

EventsSDK.on('GameEnded', () => {
    customGameNode?.DetachFromParent()
})

Events.on('CustomGameEvent', (name, data) => {
    logging.info('Custom event received:\n' + name + '\n' + JSON.stringify(data))
    //console.log('custom event', { name, data })
})