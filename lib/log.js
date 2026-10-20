export async function catatLogAdmin(supabase, user, aksi, target = null) {
  try {
    const { error } = await supabase.from("log_admin").insert({
      user_id: user?.id || null,
      email: user?.email || "admin",
      aksi: String(aksi).slice(0, 100),
      target: target ? String(target).slice(0, 200) : null,
    });
    if (error) {
      console.error("Gagal mencatat log admin:", error.message);
    }
  } catch (error) {
    console.error("Gagal mencatat log admin:", error.message);
  }
}
