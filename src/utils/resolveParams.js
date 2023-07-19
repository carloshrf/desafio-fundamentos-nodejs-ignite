const resolveParams = (path) => {
    const paramRegex = /:([a-zA-Z]+)/g;
    const getParamsRegex = path.replaceAll(paramRegex, "(?<$1>[a-zA-Z0-9\-_]+)");
    const getQueryRegex = "(?<query>\\?(.*))";

    const queryParamsFilter = new RegExp(
        `^${getParamsRegex}${getQueryRegex}?$`
    );

    return queryParamsFilter;
};

export { resolveParams };
