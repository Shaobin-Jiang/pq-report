import type { PokerGame } from "./game";

export type Suit = 'Club' | 'Diamond' | 'Heart' | 'Spade';
export type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
    suit: Suit;
    value: CardValue;
    imageUrl: string;
    numericValue: number;
}

export interface RewardCard {
    description: string;
    effect: (player: Player, game: PokerGame) => Promise<void>;
    canUse: (player: Player, game: PokerGame) => boolean;
}

export interface Player {
    name: string;
    hand: Card[];
    score: number;
    rate: number;
    isAI: boolean;
    lastDiscard: Card | null;
}

export interface Question {
    text: string;
    choices: string[];
    correctAnswer: number;
    explanation: string;
}

export interface GameState {
    currentRound: number;
    gamePhase: 'initial' | 'drawing' | 'playing' | 'comparing' | 'question' | 'ended';
    userPlayer: Player;
    aiPlayer: Player;
    drawPile: Card[];
    rewardDeck: RewardCard[];
    selectedCard: Card | null;
    currentQuestion: Question | null;
}

