import { get } from "@ngard/tiny-get"
import { format } from "date-fns"
import {numberWithSpaces} from "@/utils/formatNumbers";

export const getRelationFieldLabel = (field, option) => {
  if (!option) return ""
  let label = ""

  field.attributes?.view_fields?.forEach((el) => {
    let result = ""
    if (el?.type === "DATE")
      result = format(new Date(option[el?.slug]), "dd.MM.yyyy")
    else if (el?.type === "DATE_TIME")
      result = format(new Date(option[el?.slug]), "dd.MM.yyyy HH:mm")
    else if (el?.type === "NUMBER")
        result = numberWithSpaces(option[el?.slug])
    else result = option[el?.slug]

    label += `${result ?? ""} `
  })

  return label
}

export const getRelationFieldTabsLabel = (field, option) => {
  if (!Array.isArray(field?.view_fields)) return ""

  let label = ""

  field?.view_fields?.forEach((el) => {
    let result = ""
    if (el?.type === "DATE")
      result = format(new Date(option[el?.slug]), "dd.MM.yyyy")
    else if (el?.type === "DATE_TIME")
      result = format(new Date(option[el?.slug]), "dd.MM.yyyy HH:mm")
    else if (el?.type === "NUMBER")
      result = numberWithSpaces(option[el?.slug])
    else result = option[el?.slug]

    label += `${result ?? ""} `
  })

  return label
}

export const getRelationFieldTableCellLabel = (field, option, tableSlug) => {
  let label = ""

  field.view_fields?.forEach((el) => {
    let result = ""

    const value = get(option, `${tableSlug}.${el?.slug}`)

    if (el?.type === "DATE")
      result = value ? format(new Date(value), "dd.MM.yyyy") : ""
    else if (el?.type === "DATE_TIME")
      result = value ? format(new Date(value), "dd.MM.yyyy HH:mm") : ""
    else if (el?.type === "NUMBER")
        result = numberWithSpaces(value)
    else result = value

    label += `${result ?? ""} `
  })

  return label
}

export const getLabelWithViewFields = (viewFields, option) => {
  let label = ""

  viewFields?.forEach((field) => {
    let result = ""
    const value = get(option, field.slug)

    if (field?.type === "DATE")
      result = value ? format(new Date(value), "dd.MM.yyyy") : ""
    else if (field?.type === "DATE_TIME")
      result = value ? format(new Date(value), "dd.MM.yyyy HH:mm") : ""
    else if (field?.type === "NUMBER")
        result = numberWithSpaces(value)
    else result = value

    label += `${result ?? ""} `
  })

  return label
}
