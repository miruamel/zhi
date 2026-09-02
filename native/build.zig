const std = @import("std.zig");

pub fn build(b: *std.Build) void {
    const target = b.standardTarget(.{ .os_target = .{ .tag = .freestanding } });
    const optimize = b.option(std.OptMode) orelse .ReleaseSmall;
    
    const mod = b.addWasmModule(.{
        .name = "stream",
        .root_source_file = .{ .path = "stream/parse.zig" },
        .target = target,
        .optimize = optimize,
    });
    mod.link_export_symbols = true;
    b.installArtifact(mod);
}