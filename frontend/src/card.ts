import type { PokerGame } from './game.js';
import type { Card, Suit, CardValue, RewardCard } from './types.js';
import type { Player } from './types.js';

export class CardManager {
    public static getCardValue(value: CardValue): number {
        switch (value) {
            case 'A': return 1;
            case '2': return 2;
            case '3': return 3;
            case '4': return 4;
            case '5': return 5;
            case '6': return 6;
            case '7': return 7;
            case '8': return 8;
            case '9': return 9;
            case '10': return 10;
            case 'J': return 11;
            case 'Q': return 12;
            case 'K': return 13;
            default: return 0;
        }
    }

    private static getImageUrl(suit: Suit, value: CardValue): string {
        return `/src/images/${suit}${value}.png`;
    }

    public static createCard(suit: Suit, value: CardValue): Card {
        return {
            suit,
            value,
            imageUrl: this.getImageUrl(suit, value),
            numericValue: this.getCardValue(value)
        };
    }

    public static createRewardCard(
        description: string,
        effect: (player: Player, game: PokerGame) => Promise<void>,
        canUse: (player: Player) => boolean
    ): RewardCard {
        return {
            description,
            effect,
            canUse
        };
    }

    public static createDeck(): Card[] {
        const suits: Suit[] = ['Club', 'Diamond', 'Heart', 'Spade'];
        const values: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck: Card[] = [];

        for (const suit of suits) {
            for (const value of values) {
                deck.push(this.createCard(suit, value));
            }
        }

        return this.shuffle(deck);
    }

    public static createRewardDeck(): RewardCard[] {
        const deck: RewardCard[] = [];
        for (let i = 0; i < 5; i++) {
            deck.push({
                description: '倍率 + 2',
                effect: async (player: Player, game: PokerGame) => {
                    await game.effectIncreaseRate(player);
                },
                canUse: () => true
            });
        }
        for (let i = 0; i < 2; i++) {
            deck.push({
                description: '增加一张卡（不能超过 4 张）',
                effect: async (player: Player, game: PokerGame) => {
                    await game.effectAddCard(player);
                },
                canUse: (player: Player) => player.hand.length < 4
            });
        }
        for (let i = 0; i < 2; i++) {
            deck.push({
                description: '迫使对手弃掉最小的一张牌',
                effect: async (player: Player, game: PokerGame) => {
                    await game.effectForceOpponentDiscard(player);
                },
                canUse: (player: Player, game: PokerGame) => {
                    let opponent = player.isAI ? game.gameState.userPlayer : game.gameState.aiPlayer;
                    return opponent.hand.length > 0;
                }
            });
        }
        for (let i = 0; i < 2; i++) {
            deck.push({
                description: '将弃掉的牌的一半添加到倍率',
                effect: async (player: Player, game: PokerGame) => {
                    await game.effectTradeCardForRate(player);
                },
                canUse: (player: Player) => player.hand.length > 0
            });
        }
        for (let i = 0; i < 2; i++) {
            deck.push({
                description: '将对手倍率降低 50%',
                effect: async (player: Player, game: PokerGame) => {
                    await game.effectDecreaseOpponentRate(player);
                },
                canUse: () => true
            });
        }
        // return deck;
        return this.shuffle(deck);
    }

    public static shuffle<T>(deck: T[]): T[] {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    public static compareCards(card1: Card, card2: Card): number {
        // Returns 1 if card1 wins, -1 if card2 wins, 0 if tie
        if (card1.numericValue > card2.numericValue) return 1;
        if (card1.numericValue < card2.numericValue) return -1;
        return 0;
    }

    public static createCardElement(card: Card, isHidden = false): HTMLImageElement {
        const cardElement = document.createElement('img');
        cardElement.className = 'game-card';

        if (isHidden) {
            cardElement.src = '/src/images/Back1.png';
            cardElement.alt = 'Hidden Card';
        } else {
            cardElement.src = card.imageUrl;
            cardElement.alt = `${card.value} of ${card.suit}s`;
        }

        return cardElement;
    }

    public static createRewardCardElement(card: RewardCard, prefix: string): HTMLParagraphElement {
        const cardElement = document.createElement('p');
        cardElement.className = 'reward-card';
        cardElement.innerHTML = `<span id="prefix">${prefix}</span>：<span style="font-weight: bold; color: yellow;">${card.description}</span>`;

        return cardElement;
    }
}

