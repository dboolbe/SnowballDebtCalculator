var loanSpace = function() {

    function precisionRound(value, precision) {
        return Math.round(value * Math.pow(10.0, precision)) / Math.pow(10.0, precision);
    }

    function compoundInterest(principle, rate, periodsPerYear, periodsPerMonth) {
        return (principle * Math.pow((1 + (rate / periodsPerYear)), periodsPerMonth)) - principle;
    }

    function Loan(principle, rate, payment, periodsPerYear=365, periodsPerMonth=30, date=(new Date()), paid=false, additionalPayments={}, additionalOptions={}) {
        this.principle = precisionRound(parseFloat(principle),2);
        this.rate = parseFloat(rate);
        this.payment = precisionRound(parseFloat(payment),2);

        this.periodsPerYear = parseFloat(periodsPerYear);
        this.periodsPerMonth = parseFloat(periodsPerMonth);
        this.date = date;

        this.paid = paid || ((this.principle > 0) ? false : true);

        this.interestCharged = function() {
            return compoundInterest(this.principle, this.rate, this.periodsPerYear, this.periodsPerMonth)
        }

        this.setDate = function(month, year) {
            this.date.setMonth(month);
            this.date.setFullYear(year);
            return this.date;
        }

        this.additionalPayments = additionalPayments;
        this.additionalOptions = additionalOptions;
    }

    function getAdditionalPayment(loan) {
        let additionalFunds = (loan.additionalPayments[loan.date.getFullYear()] || {})[loan.date.getMonth()] || 0;
//        if(additionalFunds > 0) {
//            console.log("year: ",loan.date.getFullYear()," month: ",loan.date.getMonth()," additionalFunds: ",additionalFunds);
//        }
        return additionalFunds;
    }

    function processPayment(loan, payment) {
        let balance = precisionRound(loan.principle + loan.interestCharged(),2),
            amount = Math.min(balance, (payment || loan.payment) + parseFloat(getAdditionalPayment(loan)));
//        if(getAdditionalPayment(loan) > 0) {
//        console.log("loan.principles: ",loan.principle," interest: ",precisionRound(loan.interestCharged(),2)," balance: ",balance, " amount: ",amount);
//        console.log("getAdditionalPayment(loan): ",getAdditionalPayment(loan), " principle: ", balance-amount);
//        }
        return new Loan(balance-amount, loan.rate, loan.payment, loan.periodsPerYear, loan.periodsPerMonth, new Date((new Date(loan.date)).setMonth(loan.date.getMonth() + 1)), !(amount > 0) || loan.paid, loan.additionalPayments, loan.additionalOptions);
    }

    function remainingFunds(loan, payment) {
        let processedLoan = processPayment(loan, payment || precisionRound(loan.payment,2));
        return ((payment || loan.payment)) - ((loan.principle + precisionRound(loan.interestCharged(),2)) - processedLoan.principle);
    }

    function processPaymentExtra(loan, extraFunds) {
        let balance = loan.principle,
            amount = Math.min(balance, extraFunds);
        return new Loan(balance-amount, loan.rate, loan.payment, loan.periodsPerYear, loan.periodsPerMonth, new Date(loan.date), !(amount > 0) || loan.paid, loan.additionalPayments, loan.additionalOptions);
    }

    function remainingFundsExtra(loan, extraFunds) {
        let processedLoan = processPaymentExtra(loan, extraFunds);
        return extraFunds - (loan.principle - processedLoan.principle);
    }

    function addLoan(array, loan) {
        let results = [];
        for(index in array) {
            results.push(array[index]);
        }
        results.push(loan);
        return results;
    }

    function removeLoan(array, loanIndex) {
        let results = [];
        for(index in array) {
            if(index == loanIndex) { continue; }
            results.push(array[index]);
        }
        return results;
    }

    function processLoans(loans) {
        let extraFunds = remainingFundsAcrossLoans(loans);
        return $.map(loans, function(loan) {
            loan = processPayment(loan);
            tmpExtraFunds = remainingFundsExtra(loan,extraFunds);
            loan = processPaymentExtra(loan,extraFunds);
            extraFunds = tmpExtraFunds;
            return loan;
        });
    }

    function totalLoanPrinciples(loans) {
        return $.map(loans, function(loan) {
            return loan.principle;
        }).reduce(function(val,acc) {
            return val + acc;
        });
    }

    function remainingFundsAcrossLoans(loans) {
        return $.map(loans, function(loan) {
            return remainingFunds(loan);
        }).reduce(function(val,acc){
            return val + acc;
        });
    }

    function swapLoans(loans,oldIndex,newIndex) {
        let tmpArr = $.map(loans, function(loan) {
            return new Loan(loan.principle, loan.rate, loan.payment, loan.periodsPerYear, loan.periodsPerMonth, loan.date, loan.paid, loan.additionalPayments, loan.additionalOptions);
        });
        let temp = new Loan(tmpArr[newIndex].principle, tmpArr[newIndex].rate, tmpArr[newIndex].payment, tmpArr[newIndex].periodsPerYear, tmpArr[newIndex].periodsPerMonth, tmpArr[newIndex].date, loan.paid, loan.additionalPayments, loan.additionalOptions);
        tmpArr[newIndex] = new Loan(tmpArr[oldIndex].principle, tmpArr[oldIndex].rate, tmpArr[oldIndex].payment, tmpArr[oldIndex].periodsPerYear, tmpArr[oldIndex].periodsPerMonth, tmpArr[oldIndex].date, loan.paid, loan.additionalPayments, loan.additionalOptions);
        tmpArr[oldIndex] = temp;
        return tmpArr;
    }

    return {
        "createLoan": function(principle, rate, payment, periodsPerYear, periodsPerMonth, date, paid, additionalPayments, additionalOptions) {
            return new Loan(principle, rate, payment, periodsPerYear, periodsPerMonth, date, paid, additionalPayments, loan.additionalOptions);
        },
        "processPayment": processPayment,
        "processPaymentExtra": processPaymentExtra,
        "remainingFundsExtra": remainingFundsExtra,
        "totalLoanPrinciples": totalLoanPrinciples,
        "remainingFundsAcrossLoans": remainingFundsAcrossLoans,
        "swapLoans": swapLoans,
        "removeLoan": removeLoan,
        "precisionRound": precisionRound,
        "getAdditionalPayment": getAdditionalPayment
    }
}();
