/// @brief Ekstraktor field `data:` dari chunk SSE.
/// Menulis payload `data:` (dipisah '\n') ke buffer out.
/// @param input pointer chunk SSE (UTF-8)
/// @param input_len panjang input dalam byte
/// @param out pointer buffer output
/// @param out_cap kapasitas buffer output
/// @return byte ditulis; jika out_cap kurang, hasil terpotong
export fn parse_sse(
    input: [*]const u8,
    input_len: usize,
    out: [*]u8,
    out_cap: usize,
) usize {
    var written: usize = 0;
    var i: usize = 0;
    while (i < input_len) : (i += 1) {
        var j = i;
        while (j < input_len and input[j] != '\n') : (j += 1) {}
        const line = input[i..j];
        if (line.len >= 5 and std.mem.eql(u8, line[0..5], "data:")) {
            var start: usize = 5;
            while (start < line.len and line[start] == ' ') : (start += 1) {}
            const val = line[start..];
            var k: usize = 0;
            while (k < val.len and written < out_cap) : (k += 1) {
                out[written] = val[k];
                written += 1;
            }
            if (written < out_cap) {
                out[written] = '\n';
                written += 1;
            }
        }
        i = j;
    }
    return written;
}

const std = @import("std");
