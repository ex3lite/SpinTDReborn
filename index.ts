import { Events, Menu, LocalPlayer, GameState, EventsSDK, ImageData } from 'github.com/octarine-public/wrapper/index'

const spinTDEntry = new Menu.AddEntry('SpinTD Reborn', ImageData.Icons.gold_large)
spinTDEntry.AddShortDescription('Game not loaded','SpinTD Reborn features will appear when you enter the game')
let customGameNode: Menu.Node | null = null

let is_closed = false;
let buttonTest = spinTDEntry.AddButton('Change state', 'Change state of SpinTD menu', 1)
buttonTest.OnValue(() => {
    changeStateMenu(!is_closed);
    is_closed = !is_closed;
});

EventsSDK.on('GameStarted', () => {
    switch (GameState.AddonName) {
        case '2860562213': {
            const spinTDInjectEntry = Menu.AddEntry('SpinTD', ImageData.Icons.icon_courier, tooltip='Inject SpinTD features into the game')

            customGameNode = customGamesEntry.AddNode('custom_spintd')
            //customGameNode.AddDropdown()
            const goldSlider = customGameNode.AddSlider('Gold amount', 0, 0, 500, 0, 'Amount of gold to give', 1)
            const giveGoldButton = customGameNode.AddButton('Give gold', 'Give gold to yourself', 1)

            giveGoldButton.OnValue(() => {
                const gold = goldSlider.value

                CustomGameEvents.FireEventToServer('DebugAddGold', new Map<string, any>(Object.entries({
                    player_id: LocalPlayer!.PlayerID,
                    gold_number: gold
                })))
            })

            const allowBuy = customGameNode.AddToggle('Debug Buy', false, 'Ability of giving items from store for free', 2)

            allowBuy.OnValue(() => {
                CustomGameEvents.FireEventToServer('EnableDebugBuy', new Map<string, any>(Object.entries({
                    player_id: LocalPlayer!.PlayerID,
                    debug_buy: allowBuy.value ? 1 : 0
                })))
            })

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

async function changeStateMenu(is_closed:boolean = false){
    if(is_closed){
        let entry1 = new Menu.AddEntry('SpinTD Reborn', ImageData.Icons.gold_large)
        entry1.AddShortDescription('1.Game not loaded','SpinTD Reborn features will appear when you enter the game')
        entry1.DELETE();
        let buttonTest = entry1.AddButton('Change state', 'Change state of SpinTD menu', 1)
        buttonTest.OnValue(() => {
            changeStateMenu(is_closed);
            is_closed = !is_closed;
        });
    } else {
        let entry2 = new Menu.AddEntry('SpinTD Reborn', ImageData.Icons.gold_large)
        entry2.DELETE();
        entry2.AddShortDescription('2.Game not loaded','SpinTD Reborn features will appear when you enter the game')
        let buttonTest = entry2.AddButton('Change state', 'Change state of SpinTD menu', 1)
        buttonTest.OnValue(() => {
            changeStateMenu(is_closed);
            is_closed = !is_closed;
        });

    }
}
Events.on('CustomGameEvent', (name, data) => {
    console.log('custom event', { name, data })
})