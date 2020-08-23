var uiSpace = function() {

    var currencyFormater = new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
    });

    var percentFormatter = new Intl.NumberFormat("en-US",{
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    var wMonths=['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    function setupMonths() {
        let thisMonth = (new Date()).getMonth();
        let monthSelector = $('.month-selector');
        $(wMonths).each((i,month) => {
            monthSelector.append($('<option>').text(month[0].toUpperCase() + month.slice(1)).val(i).attr('selected', i === thisMonth));
        });
    }

    function setupYears() {
        let thisYear = (new Date()).getFullYear();
        let yearSelector = $('.year-selector');
        for(let i = thisYear - 5; i <= thisYear + 5; i++) {
            yearSelector.append($('<option>').text(i).val(i).attr('selected', i === thisYear));
        }
    }

    function setupMemory() {
        let memorySlotBlock = $('#memory-slots-block');
        let slotSelector = memorySlotBlock.find('.memory-slot-selector');
        let loadSlotButton = memorySlotBlock.find('.load-memory-slot');
        let clearSlotButton = memorySlotBlock.find('.clear-memory-slot');
        for(let i = 1; i <= 5; i++) {
            slotSelector.append($('<option>').text('Memory Slot ' + i).val('memory-slot-' + i));
        }
        memorySlotBlock.show();
    }

    function initializeComponents() {
        setupMonths();
        setupYears();
        if(typeof(Storage) !== "`undefined") {
            localStorage.setItem("bobby","frank");
            console.warn(localStorage.getItem("bobby"));
            setupMemory();
        } else {
            console.err("Sorry! No Web Storage Support...");
        }
    }

    function addAdditionalPaymentHandler(event, ...extraParameters) {
        event.preventDefault();
//        console.log("addAdditionalPaymentHandler");
//        console.log("event");
//        console.log(event);
//        console.log("extraParameters");
//        console.log(extraParameters);

//        console.log(extraParameters[0].loans[document.forms.payment.idx.value]);

        let loans = extraParameters[0].loans;
        let loanTable = extraParameters[0].loanTable;
        let snowballTable = extraParameters[0].snowballTable;

        let loan = loans[document.forms.payment.idx.value];
        loan.additionalPayments[document.forms.payment.year.value] = loan.additionalPayments[document.forms.payment.year.value] || {};
        loan.additionalPayments[document.forms.payment.year.value][document.forms.payment.month.value] = document.forms.payment.amount.value;
        //loan.principle = 10;

//        console.log(loan);
//        console.log(loans[document.forms.payment.idx.value]);

        loanTable.trigger("createTable", "addLoan");
        snowballTable.trigger("createTable", "addLoan");
    }

    function addAdditionalPaymentModalReset(event, ...extraParameters) {
        event.preventDefault();//console.log("reset");
        
        document.forms.payment.reset();
    }

    function addAdditionalPaymentModalSubmit(event, ...extraParameters) {
        event.preventDefault();//console.log("submit");
        //console.log(event.data);
        
        $(document.forms.payment).trigger('submit', event.data);
    }

    function initializeLoans(event, ...extraParameters) {
        let loans = event.data.loans;
        let loanTable = event.data.loanTable;
        let snowballTable = event.data.snowballTable;
        let doctorWho = event.data.doctorWho;
        loans.splice(0,0);
        for(var doctor of doctorWho) {
            loans.push(loanSpace.createLoan(doctor[0], doctor[1], doctor[2]));
        }

        loanTable.trigger("createTable");
        snowballTable.trigger("createTable");
    }

    function addLoanHandler(event, ...extraParameters) {
        event.preventDefault();//console.log("addLoanHandler");
        //console.log("event");
        //console.log(event);
        //console.log("extraParameters");
        //console.log(extraParameters);

        let form = event.target;

        let principle = loanSpace.precisionRound(parseFloat(form['principle'].value),2);
        let rate = loanSpace.precisionRound(parseFloat(form['interest-rate'].value) / 100.0,2);
        let payment = loanSpace.precisionRound(parseFloat(form['monthly-payment'].value),2);

        let loans = extraParameters[0].loans;
        let loanTable = extraParameters[0].loanTable;
        let snowballTable = extraParameters[0].snowballTable;

        loans.push(loanSpace.createLoan(principle, rate, payment));

        loanTable.trigger("createTable", "addLoan");
        snowballTable.trigger("createTable", "addLoan");
    }

    function addLoanModalReset(event, ...extraParameters) {
        event.preventDefault();
        
        document.forms.loan.reset();
    }

    function addLoanModalSubmit(event, ...extraParameters) {
        event.preventDefault();
        
        $(document.forms.loan).trigger('submit', event.data);
    }

    function updateDateInLoan(loan) {
        let month = $('#month-selector').val();
        let year = $('#year-selector').val();
        loan.setDate(month, year);
    }

    function updateDateInLoans(event, ...extraParameters) {
        let loans = event.data.loans;
        let loanTable = event.data.loanTable;
        let snowballTable = event.data.snowballTable;
        for(var index in loans) {
            var loan = loans[index];
            updateDateInLoan(loan);
        }

        loanTable.trigger("createTable");
        snowballTable.trigger("createTable");
    }

    function createOrUpdateLoanTable(event, ...extraParameters) {
        console.log("lee");
        //console.log(event);
        //console.log(event.target);
        //console.log(this);
        //console.log(extraParameters);
        let loans = event.data.loans;
        var table = $(this);

        var header = table.find(".header");
        if(header.children().length === 0) {
            header.append($("<th>").text("Principle").css("text-align","center"));
            header.append($("<th>").text("Int. Rate").css("text-align","center"));
            header.append($("<th>").text("Min. Pymt").css("text-align","center"));
            header.append($("<th>").text("Mth. Pymt").css("text-align","center"));
            header.append($("<th>").text("Actions").css("text-align","center").prop("colspan","4"));
            header.append($("<th>").text("Note").css("text-align","center"));
        }

        // clear all row except the header
        header.parent().children(":not(.header)").remove();

        for(var index in loans) {
            var loan = loans[index];
            updateDateInLoan(loan);
            var row = $("<tr>");
            row.append($("<td>").prop('align',"right").text(currencyFormater.format(loan.principle,2)));
            row.append($("<td>").prop('align',"right").text(percentFormatter.format(loan.rate)));
            row.append($("<td>").prop('align',"right").text(currencyFormater.format(loan.interestCharged())));
            row.append($("<td>").prop('align',"right").text(currencyFormater.format(loan.payment)));
            row.append($("<td>").append($("<button>").addClass("editLoan").data("id",index).text("Edit")));
            if(index != 0) {
                row.append($("<td>").append($("<button>").addClass("moveLoan").data("id",index).data("move",index-1).text("Up")));
            } else {
                row.append($("<td>"));
            }
            if(index != loans.length - 1) {
                row.append($("<td>").append($("<button>").addClass("moveLoan").data("id",index).data("move",parseInt(index)+1).text("Down")));
            } else {
                row.append($("<td>"));
            }
            row.append($("<td>").append($("<button>").addClass("deleteLoan").data("id",index).text("Delete")));
            header.parent().append(row);
        }
        var row = $("<tr>");
        row.append($("<td>").prop('align',"right").text(currencyFormater.format(loans.map((loan) => loan.principle).reduce((acc,num) => acc + num))));
        row.append($("<td>"));
        row.append($("<td>").prop('align',"right").text(currencyFormater.format(loans.map((loan) => loan.interestCharged()).reduce((acc,num) => acc + num))));
        row.append($("<td>").prop('align',"right").text(currencyFormater.format(loans.map((loan) => loan.payment).reduce((acc,num) => acc + num))));
        header.parent().append(row);
        console.log("redrawn");
    }

    function moveLoan(event, ...extraParameters) {
        console.log('id: ' + $(this).data('id'));
        console.log('move: ' + $(this).data('move'));
        console.log(extraParameters);
        let loans = event.data.loans;
        let loanTable = event.data.loanTable;
        let snowballTable = event.data.snowballTable;
        loans = loanSpace.swapLoans(loans, $(this).data("id"), $(this).data("move"));

        while(event.data.loans.length > 0) {
            event.data.loans.pop();
        }
        for(loan of loans) {
            event.data.loans.push(loanSpace.createLoan(loan.principle, loan.rate, loan.payment, loan.periodsPerYear, loan.periodsPerMonth, new Date(loan.date), loan.paid, loan.additionalPayments, loan.additionalOptions));
        }

        loanTable.trigger("createTable");
        snowballTable.trigger("createTable");
    }

    function createOrUpdateSnowballTable(event, ...extraParameters) {
        //console.log("bob");
        //console.log(event);
        //console.log(event.target);
        //console.log(this);
        //console.log(extraParameters);
        let loans = event.data.loans;

        //var mainLoans = [];
        //for(var loan of loans) {
            //console.log(loan.principle,loan.rate,loan.payment);
        //    mainLoans.push(loanSpace.createLoan(loan.principle,loan.rate,loan.payment, loan.periodsPerYear, loan.periodsPerMonth, loan.date, loan.paid, loan.additionalPayments));
        //}
        var table = $(this);
        var header = table.find(".header");
        if(header.children().length === 0) {
            for(var index in loans) {
                var loan = loans[index];
                var classes = (index % 2 === 1) ? "even" : "odd";
                header.append($("<th>").addClass(classes + " col_date").text("Date"));
                header.append($("<th>").addClass(classes + " col_principle").text("Principle"));
                header.append($("<th>").addClass(classes + " col_interest").text("Interest"));
                header.append($("<th>").addClass(classes + " col_balance").text("Balance"));
                header.append($("<th>").addClass(classes + " col_additional_payment").text("Add'l Pymt"));
                header.append($("<th>").addClass(classes + " col_remaining_principle").text("R Principle"));
            }
        }
        header.parent().find("tr:not(.header)").remove();
            
        var cnt = 0;
        while(loanSpace.totalLoanPrinciples(loans) > 0 && cnt <= 5000) {
            cnt = cnt + 1;
            var extraFunds = loanSpace.remainingFundsAcrossLoans(loans);
            var row = $("<tr>");
            row.data("loans",{});
            if(cnt % 2 === 0) { row.addClass("alt"); }
            loans = $.map(loans, function(loan, idx) {

                if(Object.keys(loan.additionalPayments).length !== 0) {console.log('pay: ',loan.additionalPayments,' amt: ',loanSpace.getAdditionalPayment(loan));}

                //console.log("loan:",loan);
                var classes = (idx % 2 === 1) ? "even" : "odd";
                classes = classes + ' snowball-entry loan' + idx;
                //var hasPrinciple = loan.paid;
                var hasPrinciple = parseInt(loan.principle * 100) > 0;
                function crap(value) {
                    return hasPrinciple ? value : "";
                }
                row.data("loans")[idx.toString()] = loan;
                row.append($("<td>").data('idx',idx).addClass(classes + " col_date").prop('align',"right").text(crap(loan.date.getMonth()+1+"/"+loan.date.getFullYear().toString().substr(-2))));
                row.append($("<td>").data('idx',idx).addClass(classes + " col_principle").prop('align',"right").text(crap(currencyFormater.format(loan.principle))));
                //console.log(loan.principle);
                row.append($("<td>").data('idx',idx).addClass(classes + " col_interest").prop('align',"right").text(crap(currencyFormater.format(loan.interestCharged()))));
                loan = loanSpace.processPayment(loan);//console.log(loan.principle);
                    
                row.append($("<td>").data('idx',idx).addClass(classes + " col_balance").prop('align',"right").text(crap(currencyFormater.format(loan.principle))));
                tmpExtraFunds = loanSpace.remainingFundsExtra(loan,extraFunds);
                row.append($("<td>").data('idx',idx).addClass(classes + " col_additional_payment").prop('align',"right").text(crap(currencyFormater.format(extraFunds - tmpExtraFunds))));
                loan = loanSpace.processPaymentExtra(loan,extraFunds);

                row.append($("<td>").data('idx',idx).addClass(classes + " col_remaining_principle").prop('align',"right").text(crap(currencyFormater.format(loan.principle)))); 
                extraFunds = tmpExtraFunds;

                return loan;
            });
            header.parent().find("tbody").append(row);
        }
        $('#dateTag').text(loans[0].date.getMonth()+"/"+loans[0].date.getFullYear().toString().substr(-2));
        //loans = mainLoans;
        //for(loan of loans) {
        //    console.log('loan => ',loan.additionalPayments);
        //}
        
        var fields = $(".col_principle, .col_interest, .col_balance, .col_additional_payment");
        $("#hide-columns").is(":checked") ? fields.hide() : fields.show();
    }

    return {
        "initializeComponents": initializeComponents,
        "initializeLoans": initializeLoans,
        "addLoanHandler": addLoanHandler,
        "addLoanModalReset": addLoanModalReset,
        "addLoanModalSubmit": addLoanModalSubmit,
        "addAdditionalPaymentHandler": addAdditionalPaymentHandler,
        "addAdditionalPaymentModalReset":addAdditionalPaymentModalReset,
        "addAdditionalPaymentModalSubmit":addAdditionalPaymentModalSubmit,
        "createOrUpdateLoanTable": createOrUpdateLoanTable,
        "moveLoan": moveLoan,
        "createOrUpdateSnowballTable": createOrUpdateSnowballTable,
        "updateDateInLoans": updateDateInLoans
    }
}();
