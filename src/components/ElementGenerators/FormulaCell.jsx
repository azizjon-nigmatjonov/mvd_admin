import { useMemo } from "react";
import { Parser } from "hot-formula-parser"
import { getWordsBetweenCurlies } from "../../utils/getWordsBetweenCurlies";
import { get } from "@ngard/tiny-get";

const parser = new Parser();


const FormulaCell = ({ field, row }) => {
  const formula = field?.attributes?.formula ?? ''

  const computedValue = useMemo(() => {

    const variables = getWordsBetweenCurlies(formula)
    let computedFormula = formula
    variables?.forEach(variable => {
      computedFormula = computedFormula.replaceAll(`{${variable}}`, get(row, variable))
    })

    const { result, error } = parser.parse(computedFormula)

    if(error) return 'Err'
    return result

  }, [ formula, row ])


  return ( <span>{computedValue}</span> );
}
 
export default FormulaCell;