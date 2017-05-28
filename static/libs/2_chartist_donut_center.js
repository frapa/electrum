Chartist.plugins.donutCenter = function (options) {
    return function (chart) {
        var defaultOptions = {
            html: '',
        };

        options = Chartist.extend({}, defaultOptions, options);

        if (chart instanceof Chartist.Pie) {
            var label = document.createElement('div');
            label.className = 'ct-donut-center-label';
            label.innerHTML = options.html;

            var coveringContainer = document.createElement('div');
            coveringContainer.className = 'ct-donut-center-label-container';
            coveringContainer.insertBefore(label, null);

            chart.container.insertBefore(coveringContainer, null);
        }
    };
};
