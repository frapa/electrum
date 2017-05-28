var App_View_Report_Category = AbstractView.extend({
    initialize: function (model) {
        this.model = model;
        this.period = 'month';
    
        this.visualizations = [
            {
                chartType: 'donut',
                chartName: 'lastPeriodTopExpenses',
                tableName: 'lastPeriodExpenses',
                selector: ['LastPeriod', 'Expense'],
            },
            {
                chartName: 'thisPeriodTopExpenses',
                chartType: 'donut',
                tableName: 'thisPeriodExpenses',
                selector: ['ThisPeriod', 'Expense'],
            }
        ];
    },
    
    loadData: function (callback) {
        var _this = this;

        afterDataFetched = new AsyncNotificationManager(callback)

        afterDataFetched.waitForAction();
        $.ajax({
            url: '/controller/report/category/month?user=' + global.username +
                '&psw=' + global.password,
            success: function (json) {
                _this.data = json;
                afterDataFetched.notifyEnd();
            }
        });
        
        afterDataFetched.waitForAction();
        this.model.to('Settings').fetch({
            success: function (settings) {
                if (settings.length) _this.settings = settings;
                afterDataFetched.notifyEnd();
            }
        });

        afterDataFetched.notifyEnd();
    },

    generateSettings: function () {
        if (!this.settings) {
            this.settings = new App_Model_PredefinedReportSettings();
        }

        this.options = {
            depth: 1,
            numDonutTopCategories: 5,
            numTableTopCategories: 7,
        };

        this.settings.set('Json', JSON.stringify(this.options));

        this.settings.save();
    },

    selectCategoriesByDepth: function (cats, depth) {
        var categories = [];

        function recurseCategories(cats, depth) {
            if (depth == 0) {
                _.each(cats, function (cat) {
                    categories.push(cat);
                });
            } else {
                _.each(cats, function (cat) {
                    recurseCategories(cat.SubCategories, depth-1)
                });
            }
        }

        recurseCategories(cats, depth);

        return categories;
    },

    sortCategories: function (categories) {
        return _.sortBy(categories,
            function (cat) {
                return cat.TotalForPeriod;
            }
        ).reverse();
    },

    computeData: function () {
        var _this = this; 

        if (!this.settings || !this.settings.get('Json')) {
            this.generateSettings();
        } else {
            this.options = JSON.parse(this.settings.get('Json'));
        }

        _.each(this.visualizations, function (vis) {
            var cats = _this.selectCategoriesByDepth(
                _this.data[vis.selector[0]][vis.selector[1]],
                _this.options.depth,
            );
            var sortedCats = _this.sortCategories(cats);

            vis.total = _this.data[vis.selector[0]]['Total' + vis.selector[1]];
            vis.num = _this.data[vis.selector[0]]['Num' + vis.selector[1]];

            if (vis.chartType == 'donut' && vis.chartName) {
                vis.series = _this.generateSeries(sortedCats);
                vis.labels = _this.generateLabels(vis.series);
                vis.legend = _this.generateLegendLabels(vis.series);
            }

            if (vis.tableName) {
                vis.tableData = _this.generateTableData(sortedCats, vis.total);
            }
        });
    },

    generateSeries: function (cats) {
        var topCats = cats.slice(0, this.options.numDonutTopCategories);
        var series = _.map(topCats, function (cat) {
            return {
                value: (cat.TotalForPeriod / 100).toFixed(),
                name: cat.Name,
            }
        });

        var otherCats = cats.slice(this.options.numDonutTopCategories);
        var sumOtherCats = _.reduce(otherCats, function(memo, cat) {
            return memo + cat.TotalForPeriod;
        }, 0);

        series.push({
            value: (sumOtherCats / 100).toFixed(),
            name: 'Others',
        });

        return series;
    },

    generateLabels: function (series) {
        var labels = _.map(series, function (item) {
            return item.value + ' €';
        });

        return labels;
    },

    generateLegendLabels: function (series) {
        var labels = _.map(series, function (item) {
            return item.name;
        });

        return labels;
    },

    generateTableData: function (cats, total) {
        var topCats = cats.slice(0, this.options.numTableTopCategories);
        var series = _.map(topCats, function (cat) {
            return {
                category: cat.Name,
                value: (cat.TotalForPeriod / 100).format(2, 3, ' ', '.') + ' €',
                percentage: (cat.TotalForPeriod / total * 100).toFixed() + ' %',
                numTransactions: cat.TransactionsForPeriod,
            }
        });

        var otherCats = cats.slice(this.options.numTableTopCategories);
        var sumOtherCats = _.reduce(otherCats, function(memo, cat) {
            return memo + cat.TotalForPeriod;
        }, 0);
        var numOtherCats = _.reduce(otherCats, function(memo, cat) {
            return memo + cat.TransactionsForPeriod;
        }, 0);

        series.push({
            category: 'Others',
            value: (sumOtherCats / 100).format(2, 3, ' ', '.') + ' €',
            percentage: (sumOtherCats / total * 100).toFixed() + ' %',
            numTransactions: numOtherCats,
        });

        return series;
    },
    
    render: function (options) {
        var _this = this;

        options.anmgr.waitForAction();
        this.loadData(function () {
            _this.computeData();

            _this.renderTables();

            AbstractView.prototype.render.call(_this, _.extend({
                
            }, options));

            _this.renderCharts();

            options.anmgr.notifyEnd();
        });
    },

    renderCharts: function () {
        var _this = this;

        _.each(this.visualizations, function (vis) {
            if (vis.chartType == 'donut') {
                var formattedTotal = (vis.total / 100).format(0, 3, ' ', '');

                new Chartist.Pie(_this.$('#' + vis.chartName)[0], {
                    series: vis.series,
                    labels: vis.labels,
                }, {
                    donut: true,
                    donutWidth: 60,
                    donutSolid: true,
                    showLabel: true,
                    plugins: [
                        Chartist.plugins.legend({
                            clickable: false,
                            legendNames: vis.legend,
                        }),
                        Chartist.plugins.donutCenter({
                            html: 'Total<br><span class="ct-donut-total">' + 
                                formattedTotal + ' €</span>'
                        }),
                    ],
                });
            }
        });
    },

    renderTables: function () {
        var _this = this;

        if (!this.subviews) {
            this.subviews = {};
        }

        _.each(this.visualizations, function (vis) {
            if (vis.tableName) {
                _this.subviews[vis.tableName] = new Kernel_View_Ui_Table({
                    columns: [
                        {header: 'Category', attr: 'category'},
                        {header: 'Expense', attr: 'value'},
                        {header: 'Fraction', attr: 'percentage'},
                        {header: 'Transaction number', attr: 'numTransactions'},
                    ],
                    collection: vis.tableData,
                });
            }
        });
    },
});
