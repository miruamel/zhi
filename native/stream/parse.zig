/// @brief Ekstraktor field `data:` dari chunk SSE.
/// Menulis payload `data:` (dipisah '\n') ke buffer out.
/// @param input pointer chunk SSE (UTF-8)
/// @param input_len panjang input dalam byte
/// @param out pointer buffer output
/// @param out_cap kapasitas buffer output
/// @return byte ditulis; jika out_cap kurang, hasil terpotong
export fn parse_sse(
    input_ptr: [*]const u8,
    input_len: usize,
    out_ptr: [*]u8,
    out_cap: usize,
) usize {
    var written: usize = 0;
    var i: usize = 0;
    while (i < input_len) : (i += 1) {
        // Cari end-of-line.
        var j: usize = i;
        while (j < input_len and input_ptr[j] != '\n') : (j += 1) {}
        // Cek prefix "data:" (5 byte).
        if (j - i >= 5 and
            input_ptr[i] == 'd' and
            input_ptr[i + 1] == 'a' and
            input_ptr[i + 2] == 't' and
            input_ptr[i + 3] == 'a' and
            input_ptr[i + 4] == ':')
        {
            var start: usize = i + 5;
            // Strip semua leading space (SSE spec, samakan dengan TS fallback).
            while (start < j and input_ptr[start] == ' ') {
                start += 1;
            }
            // Copy payload.
            var k: usize = start;
            while (k < j and written < out_cap) : (k += 1) {
                out_ptr[written] = input_ptr[k];
                written += 1;
            }
            // Trailing newline.
            if (written < out_cap) {
                out_ptr[written] = '\n';
                written += 1;
            }
        }
        i = j;
    }
    return written;
}