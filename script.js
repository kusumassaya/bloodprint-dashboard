/* =========================================================
   BLOODPRINT
   SCRIPT.JS
   ========================================================= */


/* =========================================================
   ELEMENT DASHBOARD
========================================================= */

const bloodButtons =
    document.querySelectorAll(".blood-option");

const resultBlood =
    document.getElementById("resultBlood");

const accuracy =
    document.getElementById("accuracy");

const accuracyCircle =
    document.getElementById("accuracyCircle");

const toast =
    document.getElementById("toast");

const scanButton =
    document.getElementById("scanBtn");

const sendButton =
    document.getElementById("sendBtn");

const patientIdInput =
    document.getElementById("patientId");

const patientNameInput =
    document.getElementById("patientName");


/* =========================================================
   VARIABEL
========================================================= */

let selectedBlood = "A+";


/* =========================================================
   NOTIFICATION / TOAST
========================================================= */

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);

}


/* =========================================================
   TANGGAL DAN WAKTU
========================================================= */

function updateDateTime() {

    const now = new Date();


    /* =========================
       TANGGAL
    ========================= */

    const date =
        String(
            now.getDate()
        ).padStart(2, "0");


    const monthNames = [

        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"

    ];


    const month =
        monthNames[
            now.getMonth()
        ];


    const year =
        now.getFullYear();


    /*
       Hanya tanggal.

       Tidak menampilkan:
       Senin / Selasa / Rabu / dst.
    */

    document.getElementById(
        "date"
    ).textContent =
        `${date} ${month} ${year}`;


    /* =========================
       JAM
    ========================= */

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");


    const seconds =
        String(
            now.getSeconds()
        ).padStart(2, "0");


    document.getElementById(
        "time"
    ).textContent =
        `${hours}:${minutes}:${seconds}`;

}


/*
   Jalankan setiap 1 detik
*/

setInterval(
    updateDateTime,
    1000
);


/*
   Jalankan pertama kali
*/

updateDateTime();



/* =========================================================
   ACCURACY RING
========================================================= */

function setAccuracy(value) {

    /*
       Pastikan nilai berada
       antara 0 sampai 100.
    */

    value =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );


    /*
       Tampilkan angka
    */

    accuracy.textContent =
        value;


    /*
       Radius lingkaran SVG
    */

    const radius = 78;


    /*
       Keliling lingkaran
    */

    const circumference =
        2 *
        Math.PI *
        radius;


    /*
       Hitung bagian yang terisi
    */

    const progress =
        circumference *
        (value / 100);


    /*
       Terapkan ke lingkaran
    */

    accuracyCircle.style.strokeDasharray =
        circumference;


    accuracyCircle.style.strokeDashoffset =
        circumference -
        progress;

}


/*
   Nilai awal
*/

setAccuracy(98);



/* =========================================================
   PILIH GOLONGAN DARAH
========================================================= */

bloodButtons.forEach(
    button => {


        button.addEventListener(
            "click",
            () => {


                /*
                   Hapus selected
                   dari semua tombol
                */

                bloodButtons.forEach(
                    item => {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                /*
                   Aktifkan tombol
                   yang ditekan
                */

                button.classList.add(
                    "selected"
                );


                /*
                   Simpan golongan darah
                */

                selectedBlood =
                    button.dataset.blood;


                /*
                   Notifikasi
                */

                showToast(
                    `Golongan ${selectedBlood} dipilih`
                );

            }
        );

    }
);



/* =========================================================
   MULAI SCAN
========================================================= */

scanButton.addEventListener(
    "click",
    () => {


        /* =========================
           AMBIL DATA PASIEN
        ========================= */

        const patientId =
            patientIdInput
                .value
                .trim();


        const patientName =
            patientNameInput
                .value
                .trim();



        /* =========================
           VALIDASI
        ========================= */

        if (
            patientId === "" ||
            patientName === ""
        ) {

            showToast(
                "Masukkan ID dan nama pasien terlebih dahulu"
            );

            return;

        }



        /* =========================
           UBAH STATUS BUTTON
        ========================= */

        scanButton.disabled =
            true;


        /*
           Ambil teks
           "MULAI SCAN"
        */

        const scanText =
            scanButton.querySelector(
                "span:nth-child(2)"
            );


        scanText.textContent =
            "MENGIDENTIFIKASI...";



        /* =================================================
           SIMULASI PROSES CNN
           
           SEMENTARA:
           Hasil       = A+
           Confidence  = 98%

           Nanti bagian ini dapat
           diganti dengan hasil CNN
           sebenarnya.
        ================================================== */

        setTimeout(
            () => {


                /*
                   HASIL CNN SEMENTARA
                */

                const cnnResult =
                    "A+";


                /*
                   CONFIDENCE SEMENTARA
                */

                const cnnConfidence =
                    98;



                /* =========================
                   TAMPILKAN HASIL
                ========================= */

                resultBlood.textContent =
                    cnnResult;


                setAccuracy(
                    cnnConfidence
                );



                /* =========================
                   SIMPAN GOLDAR
                ========================= */

                selectedBlood =
                    cnnResult;



                /* =========================
                   OTOMATIS PILIH
                   HASIL IDENTIFIKASI
                ========================= */

                bloodButtons.forEach(
                    button => {

                        if (
                            button.dataset.blood ===
                            cnnResult
                        ) {

                            button.classList.add(
                                "selected"
                            );

                        } else {

                            button.classList.remove(
                                "selected"
                            );

                        }

                    }
                );



                /* =========================
                   KEMBALIKAN BUTTON
                ========================= */

                scanButton.disabled =
                    false;


                scanText.textContent =
                    "MULAI SCAN";



                /* =========================
                   NOTIFIKASI
                ========================= */

                showToast(
                    `Identifikasi selesai: ${cnnResult}`
                );


            },

            1200

        );

    }
);



/* =========================================================
   KIRIM KE HARDWARE
========================================================= */

sendButton.addEventListener(
    "click",
    () => {


        /* =========================
           CEK GOLDAR
        ========================= */

        if (
            !selectedBlood
        ) {

            showToast(
                "Pilih golongan darah terlebih dahulu"
            );

            return;

        }



        /* =========================
           DISABLE BUTTON
        ========================= */

        sendButton.disabled =
            true;



        /* =========================
           UBAH TAMPILAN BUTTON
        ========================= */

        sendButton.innerHTML = `

            <span class="send-icon">
                ➤
            </span>

            MENGIRIM...

        `;



        /* =================================================
           SIMULASI KOMUNIKASI HARDWARE

           NANTI BAGIAN INI DIGANTI
           DENGAN KOMUNIKASI WI-FI
           KE ESP32.
        ================================================== */

        setTimeout(
            () => {


                /* =========================
                   NOTIFIKASI
                ========================= */

                showToast(
                    `Golongan ${selectedBlood} berhasil dikirim`
                );



                /* =========================
                   KEMBALIKAN BUTTON
                ========================= */

                sendButton.disabled =
                    false;


                sendButton.innerHTML = `

                    <span class="send-icon">
                        ➤
                    </span>

                    KIRIM

                `;


            },

            1000

        );

    }
);