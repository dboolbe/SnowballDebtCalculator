var mainSpace = function() {
    const LOANS = [
        [484.09,0.068,160],
        [4856.97,0.068,105],
        [4857.30,0.068,105],
        [4913.84,0.068,105],
        [7759.92,0.068,168],
        [8158.25,0.068,175],
        [8292.13,0.068,182],
        [6205.86,0.022,244.79],
        [9863.49,0.064,317.79],
        [106872.13,0.046,620],
        [5328.00,0.0,111]
    ];

    var loans;
    
    var loanTable;
    var snowballTable;

    function init() {
        console.info("Hello, World!");

        uiSpace.initializeComponents();

        initializeVariables();

        initializeHandlers();
    }

    function initializeVariables() {
        loans = [];

        loanTable = $("#loans");
        snowballTable = $("#snowball");
    }

    function getObjects() {
        return {
            "loans": loans,
            "loanTable": loanTable,
            "snowballTable": snowballTable,
            "doctorWho": LOANS
        };
    }

    function initializeHandlers() {
        $("body")
        .on("submit", '#'+document.forms.loan.id, uiSpace.addLoanHandler)
        .on("click", "#loanModal .reset", uiSpace.addLoanModalReset)
        .on("click", "#loanModal .submit", getObjects(), uiSpace.addLoanModalSubmit)
        .on("submit", '#'+document.forms.payment.id, uiSpace.addAdditionalPaymentHandler)
        .on("click", "#paymentModal .reset", uiSpace.addAdditionalPaymentModalReset)
        .on("click", "#paymentModal .submit", getObjects(), uiSpace.addAdditionalPaymentModalSubmit)
        .on("click", ".snowball-entry", getObjects(), function(event, ...extraParameters) {
            let loans = $(event.target).parent().data("loans");
            let idx = $(event.target).data("idx");
            let loan = loans[idx.toString()];
            //console.log(loans);
            //console.log(idx);
            //console.log(loan.date.getMonth());
            //console.log(loan.date.getFullYear());
            // initilize month and year
            document.forms.payment.idx.value = idx;
            document.forms.payment.month.value = loan.date.getMonth();
            document.forms.payment.year.value = loan.date.getFullYear();
            $('#paymentModal').modal('toggle');
        })
        .on("click", "#today", getObjects(), function(event, ...extraParameters) {
            let date = new Date();
            $("#month-selector").val(date.getMonth());
            $("#year-selector").val(date.getFullYear()).trigger("change");
        })
        .on("click", "#dw", getObjects(), uiSpace.initializeLoans)
        .on("createTable", "#loans", getObjects(), uiSpace.createOrUpdateLoanTable)
        .on("change", "#month-selector,#year-selector", getObjects(), uiSpace.updateDateInLoans)
        .on("click", ".moveLoan", getObjects(), uiSpace.moveLoan)
        .on("createTable", "#snowball", getObjects(), uiSpace.createOrUpdateSnowballTable)
        .on("click", "#hide-columns", function(event, ...extraParameters) {
            snowballTable.trigger("createTable");
        })
        .on("click", "#memory-slots-block .load-memory-slot", getObjects(), function(event, ...extraParameters) {
            let memorySlot = $(event.target).siblings('.memory-slot-selector').find(':selected').val();
            if(Object.keys(localStorage).includes(memorySlot)) {
                while(event.data.loans.length > 0) {
                    event.data.loans.pop();
                }
                for(loan of JSON.parse(localStorage.getItem(memorySlot))) {
                    event.data.loans.push(loanSpace.createLoan(loan.principle, loan.rate, loan.payment, loan.periodsPerYear, loan.periodsPerMonth, new Date(loan.date), loan.paid, loan.additionalPayments, loan.additionalOptions));
                }
                loanTable.trigger("createTable");
                snowballTable.trigger("createTable");
            } else {
                console.warn("Memory slot empty");
            }
        })
        .on("click", "#memory-slots-block .set-memory-slot", function(event, ...extraParameters) {
            let memorySlot = $(event.target).siblings('.memory-slot-selector').find(':selected').val();
            localStorage.setItem(memorySlot, JSON.stringify(mainSpace.getLoans()));
        })
        .on("click", ".deleteLoan", getObjects(), function(event, ...extraParameters) {
            console.log($(this).data('id'));
            let loans = loanSpace.removeLoan(event.data.loans, $(this).data("id"));

            while(event.data.loans.length > 0) {
                event.data.loans.pop();
            }
            for(loan of loans) {
                event.data.loans.push(loan);
            }

            loanTable.trigger("createTable");
            snowballTable.trigger("createTable");
        });
    }

    return {
        "init": init,
        "getLoans": function() { return loans; }
    }
}();

$(document).ready(function() {
    mainSpace.init();
});
