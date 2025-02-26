/**
 * TrguiNG - next gen remote GUI for transmission torrent daemon
 * Copyright (C) 2023  qu1ck (mail at qu1ck.org)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Checkbox, Grid, NativeSelect, NumberInput, Textarea, useMantineTheme } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import ColorChooser from "components/colorchooser";
import { useGlobalStyleOverrides } from "themehooks";
import type { ColorSetting, StyleOverrides } from "config";
import { ColorSchemeToggle } from "components/miscbuttons";
const { TAURI, invoke } = await import(/* webpackChunkName: "taurishim" */"taurishim");

export interface InterfaceFormValues {
    interface: {
        styleOverrides: StyleOverrides,
        skipAddDialog: boolean,
        numLastSaveDirs: number,
        defaultTrackers: string[],
    },
}

export function InterfaceSettigsPanel<V extends InterfaceFormValues>(props: { form: UseFormReturnType<V> }) {
    const theme = useMantineTheme();
    const { style, setStyle } = useGlobalStyleOverrides();
    const [systemFonts, setSystemFonts] = useState<string[]>(["Default"]);

    useEffect(() => {
        if (TAURI) {
            invoke<string[]>("list_system_fonts").then((fonts) => {
                fonts.sort();
                setSystemFonts(["Default"].concat(fonts));
            }).catch(console.error);
        } else {
            setSystemFonts(["Default", "Arial", "Verdana", "Tahoma", "Roboto"]);
        }
    }, []);

    const { setFieldValue } = props.form as unknown as UseFormReturnType<InterfaceFormValues>;

    const setTextColor = useCallback((color: ColorSetting | undefined) => {
        const newStyle = { dark: { ...style.dark }, light: { ...style.light }, font: style.font };
        newStyle[theme.colorScheme].color = color;
        setStyle(newStyle);
        setFieldValue("interface.styleOverrides", newStyle);
    }, [style, theme.colorScheme, setStyle, setFieldValue]);

    const setBgColor = useCallback((backgroundColor: ColorSetting | undefined) => {
        const newStyle = { dark: { ...style.dark }, light: { ...style.light }, font: style.font };
        newStyle[theme.colorScheme].backgroundColor = backgroundColor;
        setStyle(newStyle);
        setFieldValue("interface.styleOverrides", newStyle);
    }, [style, theme.colorScheme, setStyle, setFieldValue]);

    const setFont = useCallback((font: string) => {
        const newStyle = {
            dark: { ...style.dark },
            light: { ...style.light },
            font: font === "Default" ? undefined : font,
        };
        setStyle(newStyle);
        setFieldValue("interface.styleOverrides", newStyle);
    }, [style, setStyle, setFieldValue]);

    const defaultColor = theme.colorScheme === "dark"
        ? { color: "dark", shade: 0 }
        : { color: "dark", shade: 9 };

    const defaultBg = theme.colorScheme === "dark"
        ? { color: "dark", shade: 7 }
        : { color: "gray", shade: 0 };

    return (
        <Grid align="center">
            <Grid.Col span={1}>
                <ColorSchemeToggle />
            </Grid.Col>
            <Grid.Col span={1}>
                Font
            </Grid.Col>
            <Grid.Col span={4}>
                <NativeSelect data={systemFonts} value={style.font} onChange={(e) => { setFont(e.currentTarget.value); }} />
            </Grid.Col>
            <Grid.Col span={2}>
                Text color
            </Grid.Col>
            <Grid.Col span={1}>
                <ColorChooser value={style[theme.colorScheme].color ?? defaultColor} onChange={setTextColor} />
            </Grid.Col>
            <Grid.Col span={2}>
                Background
            </Grid.Col>
            <Grid.Col span={1}>
                <ColorChooser value={style[theme.colorScheme].backgroundColor ?? defaultBg} onChange={setBgColor} />
            </Grid.Col>
            <Grid.Col>
                <Checkbox label="Skip add torrent dialog"
                    {...props.form.getInputProps("interface.skipAddDialog", { type: "checkbox" })} />
            </Grid.Col>
            <Grid.Col span={8}>Max number of saved download directories</Grid.Col>
            <Grid.Col span={2}>
                <NumberInput
                    min={1}
                    max={100}
                    {...props.form.getInputProps("interface.numLastSaveDirs")} />
            </Grid.Col>
            <Grid.Col span={2}></Grid.Col>
            <Grid.Col>
                <Textarea minRows={10}
                    label="Default tracker list"
                    value={props.form.values.interface.defaultTrackers.join("\n")}
                    onChange={(e) => {
                        props.form.setFieldValue(
                            "interface.defaultTrackers", e.currentTarget.value.split("\n") as any);
                    }} />
            </Grid.Col>
        </Grid>
    );
}
