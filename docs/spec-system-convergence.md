# 工作日誌完整收斂規格

## Objective

讓現場人員能可靠填報、人工校正 AI 案場拆分，主管能搜尋、篩選、編修、統計與匯出；所有成本與權重在寫入前可驗證，失敗時保留可操作的錯誤訊息。

## Scope and boundaries

- Always：輸入與 AI 回傳皆驗證；拆分權重合計必須為 1；工程師選項與後台設定同步；lint、unit test、production build、browser smoke test 全通過。
- Ask first：正式 Supabase RLS／GRANT、Vercel secrets、部署與正式資料 migration。
- Never：不把 service-role key 放進前端；不讓 AI 自動把不確定資料當成事實；不在未備份時改正式 schema 或資料。

## Acceptance

1. `npm run check` exit 0。
2. 空白、超長、非法縣市與無效 AI 拆分會被拒絕。
3. 權重不等於 1 無法送出，畫面顯示合計。
4. 後台可用日期／人員／案場／內容搜尋，可依月份匯出 UTF-8 CSV。
5. 手機與桌面首頁、後台登入頁可載入，瀏覽器 console 無 error。
6. `npm audit` 為 0 vulnerabilities。

## Known external gate

Supabase 專案已獲 owner 授權恢復；正式 DB 權限收斂、資料 E2E 與部署必須在備份、migration 與回滾路徑確認後執行。

## Phase 2 owner requirements

- 產品名稱統一為「工作日誌」。
- main 更新後自動部署上線，部署失敗需可追蹤。
- 人員名單支援新增、修改與刪除；歷史日誌保留姓名快照。
- 報表同時輸出人員、車輛與案場成本分配；車輛成本需有可設定的每日成本，不以次數冒充成本。
