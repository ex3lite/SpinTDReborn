import { Events, Menu, LocalPlayer, GameState, EventsSDK, ImageData } from 'github.com/octarine-public/wrapper/index'

const customGamesEntry1 = Menu.AddEntry('SpinTD Reborn', ImageData.Icons.gold_large)
const customGamesEntry3 = customGamesEntry3.AddEntry('SpinTD Reborn', ImageData.Icons.gold_large)
let customGameNode: Menu.Node | null = null
customGamesEntry.AddShortDescription('supported_games2')

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

Events.on('CustomGameEvent', (name, data) => {
    console.log('custom event', { name, data })
})