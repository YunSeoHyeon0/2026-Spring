const roomSizeEl = document.getElementById("roomSize");
const roomStyleEl = document.getElementById("roomStyle");
const itemTypeEl = document.getElementById("itemType");
const itemAmountEl = document.getElementById("itemAmount");
const budgetEl = document.getElementById("budget");
const recommendBtn = document.getElementById("recommendBtn");
const resetBtn = document.getElementById("resetBtn");
const resultArea = document.getElementById("resultArea");
const summaryBox = document.getElementById("summaryBox");

function formatPrice(value) {
  return value.toLocaleString("ko-KR") + "원";
}

function getBudgetLimit(level) {
  if (level === "low") return 50000;
  if (level === "mid") return 100000;
  return 99999999;
}

function calculateScore(item, user) {
  let score = 0;

  if (item.suitedItems.includes(user.itemType)) score += 45;
  if (item.suitedRoom.includes(user.roomSize)) score += 20;
  if (item.styles.includes(user.roomStyle)) score += 15;
  if (item.price <= getBudgetLimit(user.budget)) score += 15;

  if (user.itemAmount === "high") {
    if (["drawer", "cabinet", "shelf"].includes(item.type)) score += 10;
  }

  if (user.itemAmount === "low") {
    if (["box", "organizer", "trolley"].includes(item.type)) score += 8;
  }

  if (user.roomSize === "small") {
    if (["drawer", "trolley", "box", "organizer"].includes(item.type)) score += 8;
    if (item.type === "cabinet") score -= 6;
  }

  return score;
}

function getItemLabel(value) {
  const labels = {
    clothes: "옷",
    books: "책",
    cosmetics: "화장품",
    misc: "잡동사니"
  };
  return labels[value];
}

function getStyleLabel(value) {
  const labels = {
    minimal: "미니멀",
    cozy: "아기자기 / 포근한 느낌",
    modern: "모던"
  };
  return labels[value];
}

function getRoomLabel(value) {
  return value === "small" ? "좁은 원룸" : "보통 크기";
}

function renderSummary(user, topPick) {
  summaryBox.innerHTML = `
    <h3>분석 요약</h3>
    <p>
      현재 방은 <strong>${getRoomLabel(user.roomSize)}</strong>이며, 스타일은 <strong>${getStyleLabel(user.roomStyle)}</strong>입니다.
      정리하고 싶은 물건은 <strong>${getItemLabel(user.itemType)}</strong>이고 양은 <strong>${user.itemAmount === "low" ? "적음" : user.itemAmount === "medium" ? "보통" : "많음"}</strong>으로 입력되었습니다.<br /><br />
      RoomFit은 이를 바탕으로 <strong>${topPick.name}</strong>을(를) 가장 적합한 수납 가구로 판단했습니다.
    </p>
  `;
}

function renderResults(recommendations) {
  if (recommendations.length === 0) {
    resultArea.className = "empty-state";
    resultArea.innerHTML = "조건에 맞는 추천 결과가 없습니다. 예산이나 스타일 조건을 조금 완화해보세요.";
    return;
  }

  resultArea.className = "cards";
  resultArea.innerHTML = recommendations.map((item, index) => `
    <article class="card">
      <div class="rank">추천 ${index + 1}순위</div>
      <h3>${item.name}</h3>
      <div class="meta">
        <div>가격<br /><strong>${formatPrice(item.price)}</strong></div>
        <div>유형<br /><strong>${item.type}</strong></div>
      </div>
      <div class="reason">${item.reason}</div>
      <div class="score">적합도 점수: ${item.score}점</div>
      <a class="buy-link" href="${item.link}" target="_blank" rel="noopener noreferrer">구매 링크 보기</a>
    </article>
  `).join("");
}

recommendBtn.addEventListener("click", () => {
  const user = {
    roomSize: roomSizeEl.value,
    roomStyle: roomStyleEl.value,
    itemType: itemTypeEl.value,
    itemAmount: itemAmountEl.value,
    budget: budgetEl.value
  };

  const recommendations = furnitureData
    .map(item => ({ ...item, score: calculateScore(item, user) }))
    .filter(item => item.price <= getBudgetLimit(user.budget))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  renderResults(recommendations);

  if (recommendations.length > 0) {
    renderSummary(user, recommendations[0]);
  }
});

resetBtn.addEventListener("click", () => {
  roomSizeEl.value = "small";
  roomStyleEl.value = "minimal";
  itemTypeEl.value = "clothes";
  itemAmountEl.value = "low";
  budgetEl.value = "low";

  summaryBox.innerHTML = `
    <h3>RoomFit 요약</h3>
    <p>왼쪽에서 내 방 정보를 입력하고 추천 버튼을 누르면, 조건에 맞는 수납 가구와 추천 이유가 나타납니다.</p>
  `;

  resultArea.className = "empty-state";
  resultArea.innerHTML = `
    아직 추천 결과가 없습니다.<br />
    방 정보와 정리할 물건을 선택한 뒤 <strong>추천 받기</strong>를 눌러보세요.
  `;
});
