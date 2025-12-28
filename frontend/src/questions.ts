import { CardManager } from './card.js';
import type { Question } from './types.js';

export class QuestionManager {
    private static index = 0;
    private static questions: Question[] = (() => {
        let original: Question[] = [
            {
                text: '在jsPsych中，如果需要在试次开始阶段动态修改即将呈现的刺激内容，应该使用哪个事件回调函数？',
                choices: [
                    '在on_start回调函数中接收并修改传入的试次对象参数',
                    '在on_load回调函数中直接操作DOM元素来改变刺激',
                    '其它方法',
                ],
                correctAnswer: 0,
                explanation:
                    '1) 正确答案解释：根据课程内容，on_start事件在试次开始解析时触发，jsPsych会向该事件的回调函数传入一个包含当前试次信息的对象。由于JavaScript对象的浅拷贝特性，在回调函数内部修改这个传入的参数对象，会直接影响原试次对象，从而改变最终的呈现效果。这正是动态调整试次细节的正确方法。2) 错误选项分析：在on_load回调函数中直接操作DOM元素来改变刺激：on_load在刺激内容已加载并呈现在屏幕上后触发，此时修改DOM虽然可能改变显示，但并非jsPsych推荐的在试次解析阶段做动态内容调整的方法。',
            },
            {
                text:
                    '在jsPsych实验中，如果需要在被试完成一个试次后，基于其按键反应向记录的数据中添加一个正确性判断字段，应该使用哪个回调函数来实现这一功能？',
                choices: [
                    '在on_finish函数中修改传入的数据对象，添加自定义字段',
                    '在on_start函数中修改传入的数据对象，添加自定义字段',
                    '其它选项',
                ],
                correctAnswer: 0,
                explanation:
                    '1) 正确答案解释：根据课程内容，on_finish回调函数会在试次结束、屏幕内容清空后触发，并且jsPsych会传入一个当前试次的数据对象。对该数据对象的修改会作用于原本记录的数据，因此这正是添加额外数据（如基于按键反应判断正确性）的正确位置。示例代码展示了在on_finish中通过判断data.response来添加correct字段。2) 错误选项分析：在on_start函数中修改传入的数据对象，添加自定义字段，在试次开始时被试尚未做出反应，无法基于按键结果添加正确性字段。',
            },
            {
                text:
                    '在jsPsych中，当同一个子时间线节点同时设置了conditional_function和loop_function时，关于这两个函数执行顺序的正确描述是什么？',
                choices: [
                    'conditional_function会在每次循环开始时执行，loop_function在每次循环结束时执行',
                    'conditional_function只在第一次循环前执行',
                    '其它描述',
                ],
                correctAnswer: 0,
                explanation:
                    '1) 正确答案解释：根据课程内容，conditional_function用于决定是否执行当前子时间线，它会在子时间线开始前执行。loop_function用于决定是否重复执行当前子时间线，它在子时间线结束后执行。当两者混用时，如果loop_function返回true导致循环继续，则在新一次的循环中，conditional_function还会被执行一次。因此，conditional_function在每次循环开始时执行，loop_function在每次循环结束时执行。2) 错误选项分析：第二个选项错误，该函数在每次循环前都执行，而不是只在第一次。',
            },
            {
                text:
                    '在jsPsych中，如果需要在每个试次开始时都执行一个特定的操作，比如记录试次类型，最简洁且易于维护的实现方式是什么？',
                choices: [
                    '在initJsPsych()的配置对象中定义on_trial_start全局事件',
                    '在每个试次对象内部手动添加一个on_start事件',
                    '在实验的主时间线循环外部添加全局处理代码',
                ],
                correctAnswer: 0,
                explanation:
                    '1) 正确答案解释：根据课程内容，全局生效的事件（如on_trial_start）是在initJsPsych()的配置对象中定义的。这种方法可以批量应用于实验中的所有试次，避免了在每个试次对象中重复添加事件的代码臃肿问题，是实现“在每个试次开始时执行特定操作”需求的最简洁且易于维护的方式。2) 错误选项分析：第二个选项功能上可行，但会导致代码重复，第三个选项实现方式不正确。',
            },
            {
                text: '在jsPsych中，on_trial_finish和on_data_update这两个事件回调函数在功能上的主要区别是什么？',
                choices: [
                    'on_data_update会在数据写入后触发，而on_trial_finish在试次结束时触发，二者执行时机不同',
                    'on_data_update专门用于数据处理，on_trial_finish用于试次处理',
                    '这两个事件功能上几乎没有区别，参数和时机基本一致',
                ],
                correctAnswer: 2,
                explanation:
                    '1) 正确答案解释：根据课程内容，on_trial_finish和on_data_update在功能上几乎没有区别。源代码分析显示，这两个事件都在finishTrial函数内部被依次调用，且传入的参数完全相同。课程明确指出，将例子中的on_trial_finish换成on_data_update，程序运行结果完全一样。2) 错误选项分析：第一、第二个选项均为错误或不完全准确的描述。',
            },
            {
                text:
                    '在jsPsych实验开发中，关于on_data_update和on_trial_finish事件的触发顺序，以下哪种说法准确地描述了其历史演变和当前逻辑？',
                choices: [
                    '最初版本中，on_data_update在试次数据写入后立刻触发，早于on_trial_finish，但后来被移到了on_trial_finish之后。',
                    '这两个事件总是同时触发',
                    '其它描述',
                ],
                correctAnswer: 0,
                explanation:
                    '1) 正确答案解释：根据课程内容，on_data_update事件最初的设计是随着试次数据的写入而触发，这个时间点早于试次的on_finish事件。然而在后续版本迭代中，该事件的触发被与数据写入操作分离，并被移到了on_trial_finish回调之后，从而导致了当前文档中描述的‘尴尬情况’。这一说法准确地概括了其历史演变和现状。2) 错误选项分析：第二个选项错误，两事件有先后顺序。',
            },
            {
                text: '在jsPsych中，如果希望用户关闭浏览器标签页时弹出确认对话框，应该如何正确设置on_close回调函数？',
                choices: [
                    "在回调函数中使用event.returnValue = '任意字符串'",
                    '在回调函数中直接返回一个非空字符串',
                    '其它写法',
                ],
                correctAnswer: 0,
                explanation:
                    "1) 正确答案解释：根据课程内容，jsPsych通过window.addEventListener('beforeunload')的方式添加on_close事件的监听。在这种方式下，要使浏览器弹出确认对话框，必须在事件回调函数中设置event.returnValue = '任意字符串'。这是与直接使用window.onbeforeunload = function() { return '字符串'; }方式的重要区别。2) 错误选项分析：第二个选项只适用于window.onbeforeunload，不适用于addEventListener绑定方式。",
            },
            {
                text:
                    '在一个jsPsych实验中，如果需要在某个试次结束后立即使用修改过的数据，应该将数据修改逻辑放在哪个事件回调中以确保执行顺序正确？',
                choices: [
                    '放在试次定义的on_finish回调中，因为它会在initJsPsych的on_trial_finish之前执行',
                    '放在initJsPsych定义的on_trial_finish回调中，因为它会先于on_finish执行',
                    '其它位置',
                ],
                correctAnswer: 0,
                explanation:
                    '1) 正确答案解释：根据jsPsych生命周期图，一个试次的事件执行顺序为：试次定义的on_finish → initJsPsych定义的on_trial_finish。因此，如果需要在on_trial_finish中使用修改过的数据，就必须在更早执行的on_finish中完成数据修改。这样才能保证执行顺序的正确性。2) 错误选项分析：第二个选项将顺序说反了，on_trial_finish是在on_finish之后执行。第三个选项错误，on_start是在试次开始时执行，远早于finish事件。',
            },
            {
                text:
                    '在jsPsych中，当使用包含动态参数和事件回调的嵌套时间线结构时，以下哪个事件序列最准确地反映了代码的实际执行顺序？',
                choices: [
                    'Timeline start → Conditional function → Dynamic parameter 1 → On trial start → On start (trial) → Dynamic parameter 2 → On load → On finish (trial) → On data update → On trial finish',
                    '其它顺序',
                    '其它描述',
                ],
                correctAnswer: 0,
                explanation:
                    '1) 正确答案解释：该序列准确地反映了jsPsych事件和参数执行的逻辑顺序。首先，在进入时间线循环前，会执行`timeline_start`和`conditional_function`。然后，对于每个试次，jsPsych会先调用动态参数函数（如`choices`）来获取参数值，接着触发`on_trial_start`。在试次内部，`on_start`在试次逻辑开始前执行，然后是动态的`stimulus`函数，接着是`on_load`（当刺激加载到DOM后）。试次结束时，先执行`on_finish`（试次定义内），再是`on_data_update`和`on_trial_finish`。',
            },
            {
                text:
                    '在jsPsych实验流程中，如果一个时间线节点包含conditional_function和loop_function，当conditional_function返回false时，接下来会发生什么？',
                choices: [
                    '跳过当前子时间线，直接执行loop_function后面的代码',
                    '继续执行on_timeline_start，然后进入试次流程',
                    '立即触发on_timeline_finish事件',
                    '其它情况',
                ],
                correctAnswer: 0,
                explanation:
                    "1) 正确答案解释：根据课程内容中关于事件触发顺序的描述，'如果 conditional_function 返回 false ，则跳到 loop_function 后面'。这意味着当条件函数返回false时，当前子时间线会被跳过，程序会直接执行loop_function之后的代码，而不会执行该子时间线内的试次。2) 错误选项分析：其他选项描述错误，因为返回false意味着时间线节点会被直接跳过，不会触发其下的流程。",
            },
            {
                text: '在jsPsych实验中，如果需要在试次开始前动态修改刺激内容，最合适的实现方式是什么？',
                choices: [
                    '在试次对象的on_start回调函数中修改传入的参数对象的相关属性',
                    '在试次对象的on_load回调函数中直接修改DOM',
                    '在on_finish回调函数中设置下一个试次刺激',
                ],
                correctAnswer: 0,
                explanation:
                    '1) 正确答案解释：根据课程内容，jsPsych在调用on_start回调函数时，会传入一个包含当前试次全部信息的对象。在回调函数内部对这个参数对象的修改，会同步影响到jsPsych后续的执行流程。因此，在on_start中修改传入对象的stimulus属性，是动态调整试次刺激内容的正确且推荐的方法。2) 错误选项分析：在on_load回调函数中直接修改DOM元素内容不是最佳实践，on_finish回调用于试次结束后的操作而不是开始前。',
            },
            {
                text: '在jsPsych实验中，如果需要在每个试次结束时记录被试的按键反应是否正确，最合适的做法是什么？',
                choices: [
                    '在on_finish事件处理函数中，根据data.response计算正确性并添加到data对象',
                    '在on_load事件处理函数中，直接修改stimulus内容以记录反应',
                    '其它方式',
                ],
                correctAnswer: 0,
                explanation:
                    '1) 正确答案解释：根据课程内容，on_finish事件处理函数会在试次结束时被调用，并接收一个包含该试次数据的data对象。在这个函数内部，我们可以访问data.response（被试的按键），将其与正确答案进行比较，并将结果（例如data.correct = true/false）添加回data对象。这是jsPsych官方推荐的在试次层面记录衍生数据（如反应正确性）的标准方法。',
            },
            {
                text:
                    '在jsPsych中，当使用conditional_function控制时间线是否执行时，如果函数返回false，会发生什么情况？',
                choices: [
                    '时间线将被跳过，其包含的所有试次都不会呈现给被试。',
                    '时间线会正常执行，但会忽略其中的刺激材料。',
                    '其它描述',
                ],
                correctAnswer: 0,
                explanation:
                    '1) 正确答案解释：根据课程内容，conditional_function用于条件性地执行时间线。当该函数返回true时，时间线会执行；当返回false时，时间线会被跳过，其包含的所有试次都不会呈现给被试。这符合代码示例中根据被试按键决定是否跳过新手教程的逻辑。',
            },
            {
                text: '在jsPsych中，当需要在所有试次开始前统一执行某些操作时，应该使用哪个全局事件？',
                choices: [
                    'on_trial_start事件会在每个试次开始时触发，适合进行全局的初始化设置',
                    'on_finish事件在整个实验流程结束时触发',
                    '其它事件',
                ],
                correctAnswer: 0,
                explanation:
                    '1) 正确答案解释：根据课程内容，on_trial_start是一个全局事件，它会在jsPsych运行的每一个试次开始前被调用。这使其成为在所有试次开始前统一执行某些操作（如初始化设置、记录日志等）的理想位置。题目中描述的“在所有试次开始前统一执行某些操作”正是该事件的核心用途。2) 错误选项分析：on_finish事件在整个实验流程全部结束时触发，on_data_update用于数据监控。',
            },
            {
                text:
                    '在jsPsych实验的生命周期中，如果我们需要在每次试次的数据被最终保存到数据集之前执行一些操作，应该使用哪个事件回调函数？',
                choices: [
                    'on_trial_finish事件，因为它会在试次结束时触发，此时数据已准备就绪',
                    'on_data_update事件，因为它会在试次数据更新后触发，可以用来做最后的操作',
                    '其它事件',
                ],
                correctAnswer: 1,
                explanation:
                    '1) 正确答案解释：根据课程内容，on_data_update事件会在jsPsych内部完成试次数据更新后触发。文档明确指出，on_data_update所调用的数据更新指的是jsPsych内部在试次结束后进行的数据更新操作，而不是实时监听数据内容变化。该操作在整个试次中只会执行一次，并且是在数据被最终保存到数据集之前。因此，如果需要在数据被最终保存前执行操作（如二次保存或验证），应使用on_data_update。2) 错误选项分析：on_trial_finish虽然也在试次结束时调用，但不保证在所有数据被最终保存前执行。',
            },
        ];
        return original.map((question) => {
            let correct = question.choices[question.correctAnswer];
            question.choices = CardManager.shuffle(question.choices);
            question.correctAnswer = question.choices.indexOf(correct);
            return question;
        });
    })();

    public static getNextQuestion(): Question {
        this.index++;
        if (this.index >= this.questions.length) {
            this.index = 0;
        }
        return { ...this.questions[this.index - 1] };
    }

    public static displayQuestion(question: Question, container: HTMLElement, callback: Function, favorAI: boolean): void {
        const questionText = container.querySelector('#question-text') as HTMLElement;
        const choicesContainer = container.querySelector('#answer-choices') as HTMLElement;

        if (!questionText || !choicesContainer) return;

        questionText.textContent = question.text;
        choicesContainer.innerHTML = '';

        question.choices.forEach((choice, index) => {
            const choiceBtn = document.createElement('button');
            choiceBtn.className = 'choice-btn';
            choiceBtn.textContent = choice;
            choiceBtn.onclick = () => this.handleAnswerSelect(index, question, container, callback, favorAI);
            choicesContainer.appendChild(choiceBtn);
        });
    }

    private static handleAnswerSelect(selectedIndex: number, question: Question, container: HTMLElement, callback: Function, favorAI: boolean): void {
        const choiceButtons = container.querySelectorAll('.choice-btn');
        const feedbackContainer = container.querySelector('#question-feedback') as HTMLElement;
        const feedbackText = container.querySelector('#feedback-text') as HTMLElement;
        const questionContent = container.querySelector('#question-content') as HTMLElement;

        if (!feedbackContainer || !feedbackText || !questionContent) return;

        // Disable all buttons and show correct/incorrect
        choiceButtons.forEach((btn, index) => {
            const button = btn as HTMLButtonElement;
            button.disabled = true;

            if (index === question.correctAnswer) {
                button.classList.add('correct');
            } else if (index === selectedIndex && index !== question.correctAnswer) {
                button.classList.add('incorrect');
            }
        });

        // Show feedback
        const isCorrect = selectedIndex === question.correctAnswer;
        feedbackText.innerText = question.explanation;

        (document.querySelector('#question-modal-title') as HTMLHeadingElement).innerHTML = isCorrect ?
            '<span style="color: #00ff00">回答正确！</span>':
            '<span style="color: #ff0000">回答错误！</span>';

        const reward_description = document.querySelector('.reward-card') as HTMLElement;
        const prefix = reward_description.querySelector('#prefix') as HTMLElement;
        if (favorAI) {
            if (isCorrect) {
                reward_description.innerHTML = '对手未获得任何加成';
            } else {
                prefix.innerHTML = '对手获得如下加成';
            }
        } else {
            if (isCorrect) {
                prefix.innerHTML = '您获得了如下加成';
            } else {
                reward_description.innerHTML = '您未获得任何加成';
            }
        }

        // Hide question, show feedback
        questionContent.classList.add('hidden');
        feedbackContainer.classList.remove('hidden');

        feedbackContainer.querySelector('#continue-btn')?.addEventListener('click', () => {
            callback(isCorrect);
        }, {once: true});
    }
}

