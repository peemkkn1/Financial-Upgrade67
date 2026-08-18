/* =================================================
   SUPABASE CONFIGURATION
================================================= */

// Project URL ของคุณ
const SUPABASE_URL =
    "https://abwynbcezzlngkuxfdzi.supabase.co";


// ใส่ ANON PUBLIC KEY ของคุณตรงนี้
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFid3luYmNlenpsbmdrdXhmZHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTI5ODcsImV4cCI6MjEwMjYyODk4N30.mA9LbYIj1VShZ0pAns4L-hQhrzS3qO_RqucXTWILWYw";


// สร้าง Supabase Client
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* =================================================
   HTML ELEMENTS
================================================= */

const incomeInput =
    document.getElementById("income");

const expenseInput =
    document.getElementById("expense");

const goalInput =
    document.getElementById("goal");

const monthsInput =
    document.getElementById("months");


const calcBtn =
    document.getElementById("calcBtn");

const saveBtn =
    document.getElementById("saveBtn");

const refreshBtn =
    document.getElementById("refreshBtn");


const resultBox =
    document.getElementById("resultBox");


const savingsPerMonthText =
    document.getElementById("savingsPerMonth");

const savingsPerDayText =
    document.getElementById("savingsPerDay");

const statusMessageText =
    document.getElementById("statusMessage");


const tableBody =
    document.getElementById("tableBody");


/* =================================================
   CALCULATE SAVINGS
================================================= */

function calculateSavings() {

    const income =
        parseFloat(incomeInput.value) || 0;

    const expense =
        parseFloat(expenseInput.value) || 0;

    const goal =
        parseFloat(goalInput.value) || 0;

    const months =
        parseFloat(monthsInput.value) || 0;


    /* ตรวจสอบข้อมูล */

    if (income <= 0) {

        alert(
            "กรุณากรอกรายได้ต่อเดือน"
        );

        return false;

    }


    if (expense < 0) {

        alert(
            "กรุณากรอกรายจ่ายให้ถูกต้อง"
        );

        return false;

    }


    if (goal <= 0) {

        alert(
            "กรุณากรอกเป้าหมายเงินเก็บ"
        );

        return false;

    }


    if (months <= 0) {

        alert(
            "กรุณากรอกระยะเวลาเก็บเงิน"
        );

        return false;

    }


    /* คำนวณ */

    const totalRequiredPerMonth =
        goal / months;


    const totalRequiredPerDay =
        totalRequiredPerMonth / 30;


    /* แสดงกล่องผลลัพธ์ */

    resultBox.classList.remove(
        "hide-box"
    );


    /* แสดงตัวเลข */

    savingsPerMonthText.innerText =
        `ต้องออมต่อเดือน: ${totalRequiredPerMonth.toLocaleString(
            "th-TH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )} บาท`;


    savingsPerDayText.innerText =
        `ต้องออมต่อวัน: ${totalRequiredPerDay.toLocaleString(
            "th-TH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )} บาท`;


    /* =================================================
       เปลี่ยนสีตามความยาก
    ================================================= */

    if (totalRequiredPerDay < 100) {

        resultBox.className =
            "result-box bg-green";


        statusMessageText.innerText =
            "สถานะเป้าหมาย: 🟢 สบายมาก! เก็บออมชิลๆ เลย";

    }


    else if (
        totalRequiredPerDay >= 100 &&
        totalRequiredPerDay < 300
    ) {

        resultBox.className =
            "result-box bg-yellow";


        statusMessageText.innerText =
            "สถานะเป้าหมาย: 🟡 ระดับปานกลาง พยายามอีกนิดสำเร็จแน่";

    }


    else if (
        totalRequiredPerDay >= 300 &&
        totalRequiredPerDay <= 500
    ) {

        resultBox.className =
            "result-box bg-orange";


        statusMessageText.innerText =
            "สถานะเป้าหมาย: 🟠 เริ่มยากแล้ว ต้องลดรายจ่ายลงหน่อยนะ";

    }


    else {

        resultBox.className =
            "result-box bg-red";


        statusMessageText.innerText =
            "สถานะเป้าหมาย: 🔴 ตึงมือมาก! แนะนำให้เพิ่มจำนวนเดือนนะ";

    }


    return true;

}


/* =================================================
   INSERT DATA INTO SUPABASE
================================================= */

async function saveToSupabase() {

    /* ตรวจสอบก่อนบันทึก */

    const isValid =
        calculateSavings();


    if (!isValid) {

        return;

    }


    /* อ่านค่าจาก Input */

    const income =
        Number(incomeInput.value);

    const expense =
        Number(expenseInput.value);

    const goal =
        Number(goalInput.value);

    const months =
        Number(monthsInput.value);


    /* =================================================
       INSERT
    ================================================= */

    const { data, error } =
        await supabaseClient

            .from("financial_data")

            .insert([
                {
                    income: income,
                    expense: expense,
                    goal: goal,
                    months: months
                }
            ])

            .select();


    /* ตรวจสอบ Error */

    if (error) {

        console.error(
            "Supabase INSERT Error:",
            error
        );


        alert(
            "❌ บันทึกข้อมูลไม่สำเร็จ\n\n" +
            error.message
        );


        return;

    }


    /* สำเร็จ */

    console.log(
        "Inserted data:",
        data
    );


    alert(
        "💾 บันทึกข้อมูลลง Supabase เรียบร้อยแล้ว!"
    );


    /* โหลดข้อมูลใหม่ */

    loadData();

}


/* =================================================
   SELECT MULTIPLE ROWS
================================================= */

async function loadData() {

    /* แสดงสถานะกำลังโหลด */

    tableBody.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="loading"
            >
                🔄 กำลังโหลดข้อมูล...
            </td>

        </tr>

    `;


    /* =================================================
       SELECT
    ================================================= */

    const { data, error } =
        await supabaseClient

            .from("financial_data")

            .select("*")

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    /* ตรวจสอบ Error */

    if (error) {

        console.error(
            "Supabase SELECT Error:",
            error
        );


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="loading"
                >
                    ❌ โหลดข้อมูลไม่สำเร็จ
                </td>

            </tr>

        `;


        return;

    }


    console.log(
        "Data from Supabase:",
        data
    );


    /* ไม่มีข้อมูล */

    if (!data || data.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="loading"
                >
                    ยังไม่มีข้อมูล
                </td>

            </tr>

        `;


        return;

    }


    /* =================================================
       สร้างตารางจากหลาย Rows
    ================================================= */

    tableBody.innerHTML = "";


    data.forEach(item => {

        const requiredPerMonth =
            Number(item.goal) /
            Number(item.months);


        const requiredPerDay =
            requiredPerMonth / 30;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${formatNumber(item.income)}
            </td>

            <td>
                ${formatNumber(item.expense)}
            </td>

            <td>
                ${formatNumber(item.goal)}
            </td>

            <td>
                ${item.months}
            </td>

            <td>
                ${formatNumber(requiredPerMonth)}
            </td>

            <td>
                ${formatNumber(requiredPerDay)}
            </td>

        `;


        tableBody.appendChild(row);

    });

}


/* =================================================
   FORMAT NUMBER
================================================= */

function formatNumber(number) {

    return Number(number).toLocaleString(
        "th-TH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* =================================================
   BUTTON EVENTS
================================================= */

calcBtn.addEventListener(
    "click",
    calculateSavings
);


saveBtn.addEventListener(
    "click",
    saveToSupabase
);


refreshBtn.addEventListener(
    "click",
    loadData
);


/* =================================================
   LOAD DATA WHEN WEBSITE OPENS
================================================= */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        loadData();

    }
);
