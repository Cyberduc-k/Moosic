import { ThisTypedComponentOptionsWithArrayProps as TTCOWRP } from "vue/types/options";
import Vue from "vue";

export default function Component<D, C, M> (opts: TTCOWRP<Vue, D, C, M, string>): TTCOWRP<Vue, D, C, M, string> {
    return opts;
}
