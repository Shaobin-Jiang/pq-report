import type { Player, Card } from './types.js';
import { CardManager } from './card.js';

export class PlayerManager {
    public static canDiscard = true;
    public static createPlayer(name: string, isAI: boolean = false): Player {
        return {
            name,
            hand: [],
            score: 0,
            rate: 1,
            isAI,
            lastDiscard: null
        };
    }

    public static addCardToHand(player: Player, card: Card): void {
        player.hand.push(card);
    }

    public static removeCardFromHand(player: Player, card: Card): boolean {
        const index = player.hand.findIndex(c =>
            c.suit === card.suit && c.value === card.value
        );

        if (index !== -1) {
            player.hand.splice(index, 1);
            return true;
        }
        return false;
    }

    public static drawCards(player: Player, deck: Card[], count: number): Card[] {
        const drawnCards: Card[] = [];

        for (let i = 0; i < count && deck.length > 0; i++) {
            const card = deck.pop()!;
            this.addCardToHand(player, card);
            drawnCards.push(card);
        }

        return drawnCards;
    }

    public static aiSelectCard(player: Player, opponent: Player): Card {
        const opponentLastDiscard: number = CardManager.getCardValue((opponent.lastDiscard as Card).value);
        // Simple AI strategy: play the middle value card
        const sortedHand = [...player.hand].sort((a, b) => a.numericValue - b.numericValue);

        const small = 0;
        const middle = Math.floor(sortedHand.length / 2);
        const large = sortedHand.length - 1;

        let index: number = 0;
        let rand = Math.random();
        if (opponentLastDiscard < 5) {
            if (rand < 0.7) {
                index = middle;
            } else if (rand < 0.75) {
                index = large; 
            } else {
                index = small;
            }
        } else if (opponentLastDiscard > 8) {
            if (rand < 0.7) {
                index = small;
            } else if (rand < 0.75) {
                index = large; 
            } else {
                index = middle;
            }
        } else {
            if (rand < 0.33) {
                index = small;
            } else if (rand < 0.67){
                index = middle;
            } else {
                index = large;
            }
        }

        return sortedHand[index];
    }

    public static renderPlayerHand(player: Player, container: HTMLElement, isHidden: boolean = false): void {
        container.innerHTML = '';

        player.hand.forEach((card, index) => {
            const cardElement = CardManager.createCardElement(card, isHidden);

            if (!isHidden && !player.isAI) {
                cardElement.addEventListener('click', () => {
                    // Remove selection from other cards
                    container.querySelectorAll('.game-card').forEach(el => {
                        el.classList.remove('selected');
                    });

                    // Select this card
                    cardElement.classList.add('selected');

                    // Enable discard button
                    const discardBtn = document.getElementById('discard-btn') as HTMLButtonElement;
                    if (discardBtn && this.canDiscard) {
                        discardBtn.disabled = false;
                    }

                    // Store selected card data
                    cardElement.dataset.cardIndex = index.toString();
                });
            }

            container.appendChild(cardElement);
        });
    }

    public static getSelectedCardIndex(container: HTMLElement): number {
        const selectedCard = container.querySelector('.game-card.selected');
        if (selectedCard && selectedCard instanceof HTMLElement) {
            return parseInt(selectedCard.dataset.cardIndex || '-1');
        }
        return -1;
    }

    public static incrementScore(player: Player): void {
        player.score++;
    }
}

