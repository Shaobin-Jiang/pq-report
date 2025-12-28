import { PokerGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Poker Game...');

    try {
        const game = new PokerGame();
        console.log('Poker Game initialized successfully!');

        // Make game instance available globally for debugging
        (window as any).game = game;
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});
