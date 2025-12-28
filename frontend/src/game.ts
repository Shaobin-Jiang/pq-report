import type { GameState, Card, Player, RewardCard } from './types.js';
import { CardManager } from './card.js';
import { PlayerManager } from './player.js';
import { QuestionManager } from './questions.js';

export class PokerGame {
    public gameState: GameState;
    private elements: { [key: string]: HTMLElement };

    constructor() {
        this.gameState = this.initializeGame();
        this.elements = this.getElements();
        this.setupEventListeners();
    }

    private initializeGame(): GameState {
        const deck = CardManager.createDeck();
        const rewardDeck = CardManager.createRewardDeck();
        PlayerManager.canDiscard = true;

        return {
            currentRound: 0,
            gamePhase: 'initial',
            userPlayer: PlayerManager.createPlayer('User', false),
            aiPlayer: PlayerManager.createPlayer('AI', true),
            drawPile: deck,
            rewardDeck: rewardDeck,
            selectedCard: null,
            currentQuestion: null
        };
    }

    private getElements(): { [key: string]: HTMLElement } {
        const ids = [
            'start-game-btn', 'discard-btn', 'reset-game-btn', 'continue-btn',
            'user-hand', 'ai-hand', 'status-message', 'user-score', 'ai-score',
            'current-round', 'cards-left', 'comparison-area', 'user-played-card',
            'ai-played-card', 'comparison-result-text', 'question-modal',
            'reward-card-display', 'question-content', 'question-feedback',
            'ai-win-modal', 'ai-continue-btn', 'ai-discard-card-area', 'ai-discarded-card',
            'user-rate', 'ai-rate'
        ];

        const elements: { [key: string]: HTMLElement } = {};
        ids.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                elements[id] = element;
            }
        });

        return elements;
    }

    private setupEventListeners(): void {
        // Start game button
        this.elements['start-game-btn']?.addEventListener('click', () => {
            this.startGame();
        });

        // Discard button
        this.elements['discard-btn']?.addEventListener('click', () => {
            (this.elements['discard-btn'] as HTMLButtonElement).disabled = true;
            let userCard = this.handleUserDiscard();
            let aiCard = this.handleAIDiscard();

            // Compare cards
            this.compareCards(userCard, aiCard);
        });

        // Reset game button
        this.elements['reset-game-btn']?.addEventListener('click', () => {
            this.resetGame();
        });
    }

    public async startGame(): Promise<void> {
        this.gameState.gamePhase = 'drawing';
        this.updateStatusMessage('正在抓取手牌……');

        // Hide start button
        if (this.elements['start-game-btn']) {
            this.elements['start-game-btn'].style.display = 'none';
        }

        // Draw 4 cards for each player with animation
        await this.drawInitialCards();

        this.gameState.gamePhase = 'playing';
        this.startNewRound();
    }

    public async effectIncreaseRate(player: Player): Promise<void> {
        player.rate += 2;
        this.updateDisplay();
    }

    public async effectAddCard(player: Player): Promise<void> {
        await this.animatedCardDraw(player, player.isAI);
        await this.sleep(300);
        this.updateDisplay();
    }

    public async effectForceOpponentDiscard(player: Player): Promise<void> {
        let opponent = player.isAI ? this.gameState.userPlayer : this.gameState.aiPlayer;
        let selectedCard = opponent.hand[0];
        for (let i = 1; i < opponent.hand.length; i++) {
            let newCard = opponent.hand[i];
            if (CardManager.getCardValue(newCard.value) < CardManager.getCardValue(selectedCard.value)) {
                selectedCard = newCard;
            }
        }
        PlayerManager.removeCardFromHand(opponent, selectedCard);
        this.updateDisplay();
    }

    public async effectTradeCardForRate(player: Player): Promise<void> {
        player.rate += CardManager.getCardValue((player.lastDiscard as Card).value) * 0.5;
    }

    public async effectDecreaseOpponentRate(player: Player) : Promise<void> {
        let opponent = player.isAI ? this.gameState.userPlayer : this.gameState.aiPlayer;
        opponent.rate = Math.round(opponent.rate * 5) / 10;
    }

    private async drawInitialCards(): Promise<void> {
        // Draw cards for user
        for (let i = 0; i < 4; i++) {
            await this.animatedCardDraw(this.gameState.userPlayer, false);
            await this.sleep(300);
        }

        // Draw cards for AI
        for (let i = 0; i < 4; i++) {
            await this.animatedCardDraw(this.gameState.aiPlayer, true);
            await this.sleep(300);
        }

        this.updateDisplay();
    }

    private async animatedCardDraw(player: Player, isHidden: boolean): Promise<void> {
        if (this.gameState.drawPile.length === 0) return;

        const drawnCards = PlayerManager.drawCards(player, this.gameState.drawPile, 1);
        if (drawnCards.length > 0) {
            const container = player.isAI ? this.elements['ai-hand'] : this.elements['user-hand'];
            if (container) {
                PlayerManager.renderPlayerHand(player, container, isHidden);

                // Add animation to the last card
                const cards = container.querySelectorAll('.game-card');
                const lastCard = cards[cards.length - 1];
                if (lastCard) {
                    lastCard.classList.add('card-draw-animation');
                }
            }
        }
    }

    private startNewRound(): void {
        this.gameState.currentRound++;
        if (this.gameState.currentRound > 2) {
            this.updateDisplay(true);
            this.endGame();
            return;
        }

        // Each player draws one more card (from 4 to 5 cards)
        Promise.all([
            this.animatedCardDraw(this.gameState.userPlayer, false),
            this.animatedCardDraw(this.gameState.aiPlayer, true),
        ]).then(
            () => {
                setTimeout(() => {
                    this.updateDisplay();
                    this.enableUserActions();
                }, 300);
            }
        )
    }

    private enableUserActions(): void {
        const userHand = this.elements['user-hand'];
        if (userHand) {
            PlayerManager.renderPlayerHand(this.gameState.userPlayer, userHand, false);
        }
        (this.elements['discard-btn'] as HTMLButtonElement).disabled = false;

        this.updateStatusMessage('弃掉一张牌');
    }

    private handleUserDiscard(): Card {
        const userHandElement = this.elements['user-hand'];
        const selectedIndex = PlayerManager.getSelectedCardIndex(userHandElement);
        const selectedCard = this.gameState.userPlayer.hand[selectedIndex];

        PlayerManager.removeCardFromHand(this.gameState.userPlayer, selectedCard);
        this.gameState.userPlayer.lastDiscard = selectedCard;
        return selectedCard;
    }
    
    private handleAIDiscard(): Card {
        // AI selects a card
        const aiSelectedCard = PlayerManager.aiSelectCard(this.gameState.aiPlayer, this.gameState.userPlayer);

        PlayerManager.removeCardFromHand(this.gameState.aiPlayer, aiSelectedCard);
        this.gameState.aiPlayer.lastDiscard = aiSelectedCard;
        return aiSelectedCard;
    }

    private compareCards(userCard: Card, aiCard: Card): void {
        this.gameState.gamePhase = 'comparing';

        // Show comparison area
        this.showComparison(userCard, aiCard);

        const result = CardManager.compareCards(userCard, aiCard);
        let resultText = '';
        let winner: Player | null = null;

        if (result > 0) {
            resultText = '您赢了!';
            winner = this.gameState.userPlayer;
            PlayerManager.incrementScore(this.gameState.userPlayer);
        } else if (result < 0) {
            resultText = '您输了!';
            winner = this.gameState.aiPlayer;
            PlayerManager.incrementScore(this.gameState.aiPlayer);
        } else {
            resultText = '平局!';
        }

        // Update comparison result
        if (this.elements['comparison-result-text']) {
            this.elements['comparison-result-text'].textContent = resultText;
        }

        // Show comparison for 2 seconds
        setTimeout(() => {
            this.hideComparison();
            if (winner == null) {
                this.handleTie();
            } else if (winner.isAI) {
                this.handleAIWin();
            } else {
                this.handleUserWin();
            }
        }, 2000);
    }

    private showComparison(userCard: Card, aiCard: Card): void {
        const comparisonArea = this.elements['comparison-area'];
        const userPlayedCard = this.elements['user-played-card'];
        const aiPlayedCard = this.elements['ai-played-card'];

        if (comparisonArea && userPlayedCard && aiPlayedCard) {
            comparisonArea.classList.remove('hidden');

            // Display user card
            userPlayedCard.innerHTML = '';
            userPlayedCard.appendChild(CardManager.createCardElement(userCard));

            // Display AI card
            aiPlayedCard.innerHTML = '';
            aiPlayedCard.appendChild(CardManager.createCardElement(aiCard));
        }
    }

    private hideComparison(): void {
        const comparisonArea = this.elements['comparison-area'];
        if (comparisonArea) {
            comparisonArea.classList.add('hidden');
        }
    }

    private handleUserWin(): void {
        // Draw a reward card
        const rewardDeck = this.gameState.rewardDeck;
        const player = this.gameState.userPlayer;
        for (let i = 0; i < rewardDeck.length; i++) {
            let card = rewardDeck[i];
            if (card.canUse(player, this)) {
                const callback = async (isCorrect: boolean) => {
                    this.hideQuestionModal();
                    if (isCorrect) {
                        this.gameState.rewardDeck.splice(i, 1);
                        await card.effect(player, this);
                    }
                    this.continueGame();
                };
                // Show question modal
                this.showQuestionModal(card, callback, '若您通过试炼，将获得如下加成', false);
                break;
            }
        }
    }

    private handleAIWin(): void {
        const rewardDeck = this.gameState.rewardDeck;
        const player = this.gameState.aiPlayer;
        for (let i = 0; i < rewardDeck.length; i++) {
            let card = rewardDeck[i];
            if (card.canUse(player, this)) {
                const callback = async (isCorrect: boolean) => {
                    this.hideQuestionModal();
                    if (!isCorrect) {
                        this.gameState.rewardDeck.splice(i, 1);
                        await card.effect(player, this);
                    }
                    this.continueGame();
                };
                // Show question modal
                this.showQuestionModal(card, callback, '若您未通过试炼，对手将获得如下加成', true);
                break;
            }
        }
    }

    private handleTie(): void {
        const rewardDeck = this.gameState.rewardDeck;
        const player = this.gameState.aiPlayer;
        for (let i = 0; i < rewardDeck.length; i++) {
            let card = rewardDeck[i];
            if (card.canUse(player, this)) {
                const callback = async (isCorrect: boolean) => {
                    this.hideQuestionModal();
                    if (!isCorrect) {
                        this.gameState.rewardDeck.splice(i, 1);
                        await card.effect(player, this);
                    }
                    this.continueGame();
                };
                // Show question modal
                this.showQuestionModal(card, callback, '若您未通过试炼，对手将获得如下加成', true);
                break;
            }
        }
    }

    private showQuestionModal(rewardCard: RewardCard, callback: (isCorrect: boolean) => Promise<void>, prefix: string, favorAI: boolean): void {
        const modal = this.elements['question-modal'];
        const rewardDisplay = this.elements['reward-card-display'];
        const questionContent = this.elements['question-content'];
        const questionFeedback = this.elements['question-feedback'];

        if (!modal || !rewardDisplay || !questionContent || !questionFeedback) return;
        (document.querySelector('#question-modal-title') as HTMLHeadingElement).innerHTML = '试炼开始！';

        // Show reward card
        rewardDisplay.innerHTML = '';
        rewardDisplay.appendChild(CardManager.createRewardCardElement(rewardCard, prefix));

        // Generate and display question
        this.gameState.currentQuestion = QuestionManager.getNextQuestion();
        QuestionManager.displayQuestion(this.gameState.currentQuestion, modal, callback, favorAI);

        // Show modal
        modal.classList.remove('hidden');
        questionContent.classList.remove('hidden');
        questionFeedback.classList.add('hidden');
    }

    private hideQuestionModal(): void {
        const modal = this.elements['question-modal'];
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    private continueGame(): void {
        this.gameState.gamePhase = 'playing';

        // Check if game should end
        if (this.gameState.drawPile.length < 2 || this.gameState.userPlayer.hand.length === 0) {
            this.endGame();
            return;
        }

        // Start next round
        this.startNewRound();
    }

    private endGame(): void {
        this.gameState.gamePhase = 'ended';
        PlayerManager.canDiscard = false;

        let userRawScore = 0;
        this.gameState.userPlayer.hand.forEach((v) => {userRawScore += CardManager.getCardValue(v.value)});
        let aiRawScore = 0;
        this.gameState.aiPlayer.hand.forEach((v) => {aiRawScore += CardManager.getCardValue(v.value)});

        const userScore = userRawScore * this.gameState.userPlayer.rate;
        const aiScore = aiRawScore * this.gameState.aiPlayer.rate;
        let finalMessage = '';

        if (userScore > aiScore) {
            finalMessage = `游戏结束，您赢了，您的手牌总和为 ${userRawScore} 分，倍率为 ${this.gameState.userPlayer.rate}，最终得分为 ${userScore} 分!`;
        } else if (aiScore > userScore) {
            finalMessage = `游戏结束，您输了，您的手牌总和为 ${userRawScore} 分，倍率为 ${this.gameState.userPlayer.rate}，您的最终得分为 ${userScore} 分!`;
        } else {
            finalMessage = `游戏结束，双方难分胜负，您的手牌总和为 ${userRawScore} 分，倍率为 ${this.gameState.userPlayer.rate}，最终得分为 ${userScore} 分!`;
        }

        this.updateStatusMessage(finalMessage);

        // Show start button again
        if (this.elements['start-game-btn']) {
            this.elements['start-game-btn'].style.display = 'inline-block';
            this.elements['start-game-btn'].textContent = '再来一局';
        }
    }

    private resetGame(): void {
        this.gameState = this.initializeGame();
        this.updateDisplay();
        this.updateStatusMessage('');

        // Show start button
        if (this.elements['start-game-btn']) {
            this.elements['start-game-btn'].style.display = 'inline-block';
            this.elements['start-game-btn'].textContent = '开始游戏';
        }

        // Disable discard button
        if (this.elements['discard-btn']) {
            (this.elements['discard-btn'] as HTMLButtonElement).disabled = true;
        }

        // Hide comparison area and modal
        this.hideComparison();
        this.hideQuestionModal();
    }

    private updateDisplay(showAi: boolean = false): void {
        // Update player hands
        if (this.elements['user-hand']) {
            PlayerManager.renderPlayerHand(this.gameState.userPlayer, this.elements['user-hand'], false);
        }

        if (this.elements['ai-hand']) {
            PlayerManager.renderPlayerHand(this.gameState.aiPlayer, this.elements['ai-hand'], !showAi);
        }

        // Update round and cards left
        if (this.elements['current-round']) {
            this.elements['current-round'].textContent = this.gameState.currentRound.toString();
        }

        if (this.elements['cards-left']) {
            this.elements['cards-left'].textContent = this.gameState.drawPile.length.toString();
        }

        // Disable discard button initially
        if (this.elements['discard-btn']) {
            (this.elements['discard-btn'] as HTMLButtonElement).disabled = true;
        }

        this.elements['user-rate'].textContent = this.gameState.userPlayer.rate.toString();
        this.elements['ai-rate'].textContent = this.gameState.aiPlayer.rate.toString();
    }

    private updateStatusMessage(message: string): void {
        if (this.elements['status-message']) {
            this.elements['status-message'].textContent = message;
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

