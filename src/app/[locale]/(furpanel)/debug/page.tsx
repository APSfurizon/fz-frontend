"use client";
import FpButton from "@/components/input/fpButton";
import FpInput from "@/components/input/fpInput";
import Modal from "@/components/modal";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import StatusBox from "@/components/statusBox";
import { useState } from "react";
//import { AutoInputDebugUserManager } from "@/app/_lib/components/autoInput";
import { useAppForm } from "@/components/form";
import { WebComboboxConfig } from "@/components/form/custom/webCombobox";
import Icon from "@/components/icon";
import FpSelect from "@/components/input/fpSelect";
import { FieldGroup } from "@/components/ui/field";
import { CountrySearchResult, getAutoInputCountries } from "@/lib/api/geo";
import { filterSearchResult, SearchType } from "@/lib/components/autoInput";
import { SelectGroup, SelectItem } from "@/lib/components/fpSelect";
import { inputEntityCodeExtractor } from "@/lib/components/input";
import z from "zod";

class CountriesWebCombobox extends WebComboboxConfig<CountrySearchResult, string[]> {
  public itemToValue(option: CountrySearchResult): string {
    return option.code!;
  }
  public searchFn(): (query: string, signal: AbortSignal, locale: string) => Promise<CountrySearchResult[]> {
    return (query: string, _signal: AbortSignal, locale: string) =>
      getAutoInputCountries().then((result) => filterSearchResult(query, SearchType.RANKED, result, locale));
  }
  public inquiringFn(): (values: string[], signal: AbortSignal) => Promise<CountrySearchResult[]> {
    return (values: string[]) =>
      getAutoInputCountries().then((result) => values.map((v) => result.find((r) => r.code === v)).filter((u) => !!u));
  }
  public optionsRenderer(option: CountrySearchResult, locale: string): React.ReactNode {
    return (
      <p>
        <span className={"fi fis fi-" + option?.code?.toLowerCase() + " rounded-xs"}></span>
        &nbsp;
        {option?.getDescription(locale)}
      </p>
    );
  }
  public selectionsRenderer(selection: CountrySearchResult, locale: string): React.ReactNode {
    return (
      <p>
        <span className={"fi fis fi-" + selection?.code?.toLowerCase() + " rounded-xs"}></span>
        &nbsp;
        {selection?.getDescription(locale)}
      </p>
    );
  }
}

export default function Home() {
  const [isOpen, setOpen] = useState(false);

  const [titleInput, setTitleInput] = useState("Esempio di un Titolo");

  const group1 = new SelectGroup(
    [
      new SelectItem(1, "aa", "aLetter", "PERSON", undefined, undefined, { it: "ciao", en: "Hello" }),
      new SelectItem(2, "bb", "bLetter", "ROTATE_LEFT", undefined, undefined, { it: "razzo", en: "Rocket" }),
    ],
    "gouppone",
    { it: "Gruppo", en: "Group" }
  );
  const group2 = new SelectGroup(
    [
      new SelectItem(1, "aa", "aLetter", "PERSON", undefined, undefined, { it: "ciao", en: "Hello" }),
      new SelectItem(2, "bb", "bLetter", "ROTATE_LEFT", undefined, undefined, { it: "razzo", en: "Rocket" }),
    ],
    "gouppone",
    { it: "Gruppo", en: "Group" }
  );
  const group3 = new SelectGroup(
    [
      new SelectItem(1, "aa", "aLetter", "PERSON", undefined, undefined, { it: "ciao", en: "Hello" }),
      new SelectItem(2, "bb", "bLetter", "ROTATE_LEFT", undefined, undefined, { it: "razzo", en: "Rocket" }),
    ],
    "gouppone",
    { it: "Gruppo", en: "Group" }
  );
  const group4 = new SelectGroup(
    [
      new SelectItem(1, "aa", "aLetter", "PERSON", undefined, undefined, { it: "ciao", en: "Hello" }),
      new SelectItem(2, "bb", "bLetter", "ROTATE_LEFT", undefined, undefined, { it: "razzo", en: "Rocket" }),
    ],
    "gouppone",
    { it: "Gruppo", en: "Group" }
  );
  const item3 = new SelectItem(3, "cc", "cLetter", "BED", undefined, undefined, { it: "Libro", en: "Book" });

  const selectItems: (SelectItem | SelectGroup)[] = [group1, item3, group2, group3, group4];

  const formDebug = useAppForm({
    defaultValues: {
      countries: "",
    },
    validators: {
      onChange: z.object({
        countries: z
          .string()
          .transform((v) => v.split(","))
          .refine((v) => !v.includes("FR"), {
            error: "France is not allowed",
          }),
      }),
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <div className="page">
      <form
        id="owo-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          formDebug.handleSubmit();
        }}
      >
        <FieldGroup>
          <formDebug.AppField
            name="countries"
            key="countries"
            children={(field) => (
              <field.WebComboboxField multiple={true} label="CIao" max={5} config={new CountriesWebCombobox()} />
            )}
          ></formDebug.AppField>
        </FieldGroup>
        <formDebug.AppForm>
          <formDebug.Button type="submit" form="owo-form">
            <Icon icon="KEY" data-icon="inline-end" />
            Login
          </formDebug.Button>
        </formDebug.AppForm>
      </form>
      <NoticeBox theme={NoticeTheme.Success} title="Wow">
        It works
      </NoticeBox>
      <div style={{ display: "flex" }}>
        <div style={{ flexDirection: "column", marginRight: 5 }}>
          <FpInput label={titleInput} onChange={(e) => setTitleInput(e.target.value)} />
          <FpInput inputType="number" label={"Number"} />
        </div>
        <div style={{ flexDirection: "column", marginRight: 5 }}>
          <FpInput inputType="password" label={"Password"} placeholder="Insert password" />
          <FpInput label={"Disabled"} disabled placeholder="Not editable" />
        </div>
        <div>
          <FpInput label={"Loading"} busy />
          <FpInput label={"Error"} hasError />
        </div>
      </div>
      <div className="horizontal-list gap-2mm">
        {/* <AutoInput manager={new AutoInputDebugUserManager()} multiple max={5} label={"Invite in room"} placeholder="Search user by name" style={{maxWidth: "500px"}}/> */}
        <FpInput label={"Error"} hasError />
      </div>
      <StatusBox>Triple room</StatusBox>
      <StatusBox status="warning">2024</StatusBox>
      <StatusBox status="success">Open</StatusBox>
      <StatusBox status="normal">Pending</StatusBox>
      <StatusBox status="error">Rejected</StatusBox>
      <Modal title="A title" open={isOpen} onClose={() => setOpen(false)}>
        <span>a modal</span>
      </Modal>
      <FpButton
        onClick={() => {
          setOpen(true);
        }}
        icon="BED"
      >
        Modal
      </FpButton>
      <FpSelect
        fieldName="d"
        items={selectItems}
        hasError
        label="WoW"
        placeholder="select"
        itemExtractor={inputEntityCodeExtractor}
      />
    </div>
  );
}
