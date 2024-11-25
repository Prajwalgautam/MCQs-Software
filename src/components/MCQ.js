import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MCQ = () => {
    const [questions, setQuestions] = useState([]);
    const [selectedChoices, setSelectedChoices] = useState({});
    const [score, setScore] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(7200); // Timer state (7200 seconds = 2 hours)
    const [isTimerRunning, setIsTimerRunning] = useState(true); // Flag to control timer

    const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/questions/';

    useEffect(() => {
        fetchQuestions();
        const savedScore = localStorage.getItem('score');
        if (savedScore) {
            setScore(Number(savedScore));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('score', score);
    }, [score]);

    useEffect(() => {
        let timerInterval;
        if (isTimerRunning && timer > 0) {
            timerInterval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerRunning(false);
            // Handle timeout behavior (like submitting the quiz automatically)
            setQuizFinished(true);
        }

        return () => clearInterval(timerInterval); // Cleanup on component unmount
    }, [isTimerRunning, timer]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            const shuffledQuestions = shuffleArray(response.data);
            setQuestions(shuffledQuestions);
        } catch (err) {
            setError('Failed to load questions. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    const handleChoiceSelect = (questionId, choiceId, isCorrect) => {
        if (submitted) return;

        setSelectedChoices({
            ...selectedChoices,
            [questionId]: { choiceId, isCorrect },
        });
    };

    const handleSubmit = () => {
        if (!submitted) {
            const currentQuestion = questions[currentQuestionIndex];
            const selectedChoice = selectedChoices[currentQuestion.id];

            if (selectedChoice?.isCorrect) {
                setScore((prevScore) => prevScore + 1);
            }

            setSubmitted(true);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
            setSelectedChoices({});
            setSubmitted(false);
        } else {
            setQuizFinished(true);
        }
    };

    const handleSkipQuestion = () => {
        // Skip to the next question without checking or scoring
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
            setSelectedChoices({});
            setSubmitted(false);
        } else {
            setQuizFinished(true);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && submitted) {
            handleNextQuestion();
        }
    };

    // Convert seconds to HH:MM:SS format
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-2xl font-semibold">
                Loading questions...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-2xl font-semibold text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" onKeyDown={handleKeyPress} tabIndex={0}>
            {/* Timer */}
            <div className="absolute left-4 top-4 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-600 flex items-center justify-center text-2xl font-semibold">
                    {formatTime(timer)}
                </div>
            </div>

            <div className="absolute top-4 right-4 text-xl font-semibold">
                <span className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md">
                    Score: {score} / {questions.length}
                </span>
            </div>

            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">Software Multiple Choice Questions</h1>

                {questions.length > 0 && !quizFinished && (
                    <div
                        key={questions[currentQuestionIndex].id}
                        className="bg-white rounded-lg shadow-lg p-6 transition-transform duration-300 hover:scale-105"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">
                            {questions[currentQuestionIndex].text}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {questions[currentQuestionIndex].choices.map((choice) => {
                                const isSelected =
                                    selectedChoices[questions[currentQuestionIndex].id]?.choiceId === choice.id;
                                const isCorrect = choice.is_correct;

                                let choiceClass = 'bg-blue-100 text-gray-700 border-blue-500';

                                if (submitted) {
                                    if (isSelected) {
                                        choiceClass = isCorrect
                                            ? 'bg-green-500 text-white border-green-600'
                                            : 'bg-red-500 text-white border-red-600';
                                    } else {
                                        choiceClass = 'bg-gray-100 text-gray-700 border-gray-300';
                                    }
                                } else if (isSelected) {
                                    choiceClass = 'bg-blue-500 text-white border-blue-600';
                                }

                                return (
                                    <div
                                        key={choice.id}
                                        className={`${choiceClass} p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105`}
                                        onClick={() =>
                                            !submitted &&
                                            handleChoiceSelect(
                                                questions[currentQuestionIndex].id,
                                                choice.id,
                                                choice.is_correct
                                            )
                                        }
                                        role="button"
                                        aria-pressed={isSelected}
                                    >
                                        <h3 className="text-lg font-semibold">{choice.text}</h3>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="text-center mt-8 space-x-4">
                    <button
                        className={`px-8 py-3 text-lg font-semibold rounded-lg shadow-md transition-all ${
                            submitted
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                        onClick={handleSubmit}
                        disabled={submitted}
                    >
                        {submitted ? 'Submitted' : 'Submit Answers'}
                    </button>

                    <button
                        className="px-8 py-3 text-lg font-semibold bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition-all"
                        onClick={handleSkipQuestion}
                    >
                        Skip Question
                    </button>
                </div>

                {submitted && !quizFinished && (
                    <div className="text-center mt-6">
                        <button
                            className="px-8 py-3 text-lg font-semibold bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all"
                            onClick={handleNextQuestion}
                        >
                            Next Question
                        </button>
                    </div>
                )}

                {quizFinished && (
                    <div className="text-center mt-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Congratulations! Your final score is {score} / {questions.length}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            {score === questions.length
                                ? 'Perfect! You nailed it!'
                                : 'Great job! Keep practicing to improve.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MCQ;
