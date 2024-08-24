// 各HTML要素を取得
const startButton = document.getElementById('startRecording');
const stopButton = document.getElementById('stopRecording');
const memoInput = document.getElementById('memoInput');
const summaryElement = document.getElementById('summary');
const hashtagsElement = document.getElementById('hashtags');

let recognition;

// ブラウザがWeb Speech APIをサポートしているか確認
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
} else {
    alert('お使いのブラウザはWeb Speech APIに対応していません。');
}

recognition.continuous = true;  // 音声認識を継続的に行う設定
recognition.interimResults = true;  // 中間結果も取得
recognition.lang = 'ja-JP';  // 言語を日本語に設定

// ページ読み込み時にローカルストレージからデータを読み込む
window.onload = function() {
    if (localStorage.getItem('memoText')) {
        memoInput.value = localStorage.getItem('memoText');
    }
    if (localStorage.getItem('summaryText')) {
        summaryElement.innerText = localStorage.getItem('summaryText');
    }
    if (localStorage.getItem('hashtagsText')) {
        hashtagsElement.innerHTML = localStorage.getItem('hashtagsText');
    }
};

// 録音開始時の処理
recognition.onstart = function() {
    startButton.disabled = true;  // 開始ボタンを無効化
    stopButton.disabled = false;  // 停止ボタンを有効化
    memoInput.value = '';  // テキストエリアをリセット
    summaryElement.innerText = '録音中...';
    hashtagsElement.innerHTML = '';  // ハッシュタグ表示エリアをリセット
};

// 音声認識の結果を処理
recognition.onresult = function(event) {
    let interimTranscript = '';  // 中間結果の保存用
    let finalTranscript = '';  // 最終結果の保存用

    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;  // 確定した結果を保存
        } else {
            interimTranscript += event.results[i][0].transcript;  // 中間結果を保存
        }
    }

    memoInput.value = finalTranscript || interimTranscript;  // テキストエリアに結果を表示
    localStorage.setItem('memoText', memoInput.value);  // ローカルストレージに保存
};

// エラー処理
recognition.onerror = function(event) {
    console.error('認識エラー:', event.error);
};

// 録音終了時の処理
recognition.onend = function() {
    startButton.disabled = false;  // 開始ボタンを有効化
    stopButton.disabled = true;  // 停止ボタンを無効化
    summaryElement.innerText = '録音が終了しました。要約を生成してください。';
};

// 録音開始ボタンのクリックイベント
startButton.addEventListener('click', () => {
    recognition.start();  // 音声認識を開始
});

// 録音停止ボタンのクリックイベント
stopButton.addEventListener('click', () => {
    recognition.stop();  // 音声認識を停止
});

// 要約生成の処理
function generateSummary() {
    const memoText = memoInput.value;
    if (memoText.trim() !== '') {
        const words = memoText.split(' ');
        const summary = words.slice(0, 30).join(' ') + '...';  // 最初の30語を要約として表示
        summaryElement.innerText = `要約: ${summary}`;
        localStorage.setItem('summaryText', summaryElement.innerText);  // ローカルストレージに保存
    } else {
        summaryElement.innerText = '要約: メモがありません';
    }
}

// ハッシュタグ生成の処理
function generateHashtags() {
    const memoText = memoInput.value;
    if (memoText.trim() !== '') {
        const commonWords = ["の", "は", "に", "を", "が", "で", "と", "も", "だ", "し", "など"];
        const words = memoText.split(/\s+/);
        const filteredWords = words.filter(word => !commonWords.includes(word) && word.length > 1);
        const uniqueWords = Array.from(new Set(filteredWords));  // 重複を除去

        const hashtags = uniqueWords.map(word => {
            const chunks = word.match(/.{1,5}/g);  // 単語を最大5文字ごとに区切る
            return chunks.map(chunk => `#${chunk}`).join(' ');
        });

        hashtagsElement.innerHTML = hashtags.join(' ');
        localStorage.setItem('hashtagsText', hashtagsElement.innerHTML);  // ローカルストレージに保存
    } else {
        hashtagsElement.innerText = 'ハッシュタグ: メモがありません';
    }
}
