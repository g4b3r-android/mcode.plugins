/* MCode Python Import Checker v1.0.0 - self-contained plugin for CodeEditorAPI 1.1.0 */
(() => {
  'use strict';
  const ID = 'python-import-checker';
  const MARKER = 'MCODE_IMPORT_CHECKER_JSON:';
  const MAX_SNAPSHOT_BYTES = 57000;
  const MAX_FILES = 350;
  const CORE_B64 = 'IiIiTUNvZGUgSW1wb3J0IENoZWNrZXI6IGluc3BlY3QgUHl0aG9uIGltcG9ydHMgd2l0aG91dCBpbXBvcnRpbmcgdXNlciBtb2R1bGVzLiIiIgppbXBvcnQgYXN0CmltcG9ydCBiYXNlNjQKaW1wb3J0IGltcG9ydGxpYi5tYWNoaW5lcnkKaW1wb3J0IGpzb24KaW1wb3J0IG9zCmZyb20gcGF0aGxpYiBpbXBvcnQgUGF0aAppbXBvcnQgc3lzCgpQUkVGSVggPSAnTUNPREVfSU1QT1JUX0NIRUNLRVJfSlNPTjonClNLSVBfRElSUyA9IHsnLmdpdCcsICcuaGcnLCAnLnN2bicsICcudmVudicsICd2ZW52JywgJ2VudicsICdfX3B5Y2FjaGVfXycsCiAgICAgICAgICAgICAnbm9kZV9tb2R1bGVzJywgJ2Rpc3QnLCAnYnVpbGQnLCAnLmdyYWRsZScsICcuaWRlYScsICcubXlweV9jYWNoZScsCiAgICAgICAgICAgICAnLnB5dGVzdF9jYWNoZScsICdzaXRlLXBhY2thZ2VzJywgJy50b3gnfQpNQVhfRElTS19GSUxFUyA9IDEyMDAKTUFYX0RJU0tfQllURVMgPSA4ICogMTAyNCAqIDEwMjQKTUFYX1NJTkdMRV9GSUxFID0gMjU2ICogMTAyNAoKCmRlZiBub3JtYWxpemUobmFtZSk6CiAgICBwYXJ0cyA9IHN0cihuYW1lKS5yZXBsYWNlKCdcXCcsICcvJykuc3BsaXQoJy8nKQogICAgaWYgYW55KHBhcnQgPT0gJy4uJyBmb3IgcGFydCBpbiBwYXJ0cyk6CiAgICAgICAgcmV0dXJuIE5vbmUKICAgIHJldHVybiAnLycuam9pbihwYXJ0IGZvciBwYXJ0IGluIHBhcnRzIGlmIHBhcnQgbm90IGluICgnJywgJy4nKSkKCgpkZWYgY29sbGVjdF9kaXNrX2ZpbGVzKCk6CiAgICAiIiJTY2FuIGN3ZCB3aXRoIHF1b3RhcywgbmV2ZXIgcmVhZCBvdXRzaWRlIGl0IHZpYSBzeW1saW5rcy4iIiIKICAgIHJvb3QgPSBvcy5wYXRoLnJlYWxwYXRoKG9zLmdldGN3ZCgpKQogICAgcmVzdWx0ID0ge30KICAgIHVzZWQgPSAwCiAgICBza2lwcGVkID0gMAogICAgZm9yIGN1cnJlbnQsIGRpcnMsIGZpbGVzIGluIG9zLndhbGsocm9vdCwgZm9sbG93bGlua3M9RmFsc2UpOgogICAgICAgIGRpcnNbOl0gPSBzb3J0ZWQoZCBmb3IgZCBpbiBkaXJzIGlmIGQgbm90IGluIFNLSVBfRElSUyBhbmQgbm90IG9zLnBhdGguaXNsaW5rKG9zLnBhdGguam9pbihjdXJyZW50LCBkKSkpCiAgICAgICAgZm9yIGZpbGVuYW1lIGluIHNvcnRlZChmaWxlcyk6CiAgICAgICAgICAgIGlmIG5vdCBmaWxlbmFtZS5sb3dlcigpLmVuZHN3aXRoKCcucHknKToKICAgICAgICAgICAgICAgIGNvbnRpbnVlCiAgICAgICAgICAgIGlmIGxlbihyZXN1bHQpID49IE1BWF9ESVNLX0ZJTEVTOgogICAgICAgICAgICAgICAgc2tpcHBlZCArPSAxCiAgICAgICAgICAgICAgICBjb250aW51ZQogICAgICAgICAgICBhYnNvbHV0ZSA9IG9zLnBhdGguam9pbihjdXJyZW50LCBmaWxlbmFtZSkKICAgICAgICAgICAgdHJ5OgogICAgICAgICAgICAgICAgaWYgb3MucGF0aC5pc2xpbmsoYWJzb2x1dGUpOgogICAgICAgICAgICAgICAgICAgIHNraXBwZWQgKz0gMQogICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlCiAgICAgICAgICAgICAgICBzaXplID0gb3Muc3RhdChhYnNvbHV0ZSkuc3Rfc2l6ZQogICAgICAgICAgICAgICAgaWYgc2l6ZSA+IE1BWF9TSU5HTEVfRklMRSBvciB1c2VkICsgc2l6ZSA+IE1BWF9ESVNLX0JZVEVTOgogICAgICAgICAgICAgICAgICAgIHNraXBwZWQgKz0gMQogICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlCiAgICAgICAgICAgICAgICB3aXRoIG9wZW4oYWJzb2x1dGUsICdyJywgZW5jb2Rpbmc9J3V0Zi04LXNpZycpIGFzIHN0cmVhbToKICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBzdHJlYW0ucmVhZCgpCiAgICAgICAgICAgICAgICBuYW1lID0gbm9ybWFsaXplKG9zLnBhdGgucmVscGF0aChhYnNvbHV0ZSwgcm9vdCkpCiAgICAgICAgICAgICAgICBpZiBuYW1lOgogICAgICAgICAgICAgICAgICAgIHJlc3VsdFtuYW1lXSA9IHNvdXJjZQogICAgICAgICAgICAgICAgICAgIHVzZWQgKz0gc2l6ZQogICAgICAgICAgICBleGNlcHQgKE9TRXJyb3IsIFVuaWNvZGVFcnJvcik6CiAgICAgICAgICAgICAgICBza2lwcGVkICs9IDEKICAgIHJldHVybiByZXN1bHQsIHNraXBwZWQKCgpkZWYgYnVpbGRfbW9kdWxlcyhuYW1lcyk6CiAgICAiIiJCdWlsZCBwbGF1c2libGUgcHJvamVjdCBtb2R1bGUgbmFtZXMsIGFjY2VwdGluZyBmbGF0L3NyYyBsYXlvdXRzLiIiIgogICAgbW9kdWxlcyA9IHNldCgpCiAgICBiYXNlcyA9IFtdCiAgICBmb3IgbmFtZSBpbiBuYW1lczoKICAgICAgICBuYW1lID0gbm9ybWFsaXplKG5hbWUpCiAgICAgICAgaWYgbmFtZSBhbmQgbmFtZS5sb3dlcigpLmVuZHN3aXRoKCcucHknKToKICAgICAgICAgICAgcGFydHMgPSBuYW1lLnNwbGl0KCcvJykKICAgICAgICAgICAgaWYgcGFydHNbMF0gaW4gKCdzcmMnLCAnbGliJykgYW5kIGxlbihwYXJ0cykgPiAxOgogICAgICAgICAgICAgICAgcGFydHMgPSBwYXJ0c1sxOl0KICAgICAgICAgICAgYmFzZSA9IHBhcnRzWzotMV0KICAgICAgICAgICAgc3RlbSA9IHBhcnRzWy0xXVs6LTNdCiAgICAgICAgICAgIGlmIHN0ZW0gPT0gJ19faW5pdF9fJzoKICAgICAgICAgICAgICAgIHJvdXRlID0gYmFzZQogICAgICAgICAgICBlbHNlOgogICAgICAgICAgICAgICAgcm91dGUgPSBiYXNlICsgW3N0ZW1dCiAgICAgICAgICAgIGlmIHJvdXRlIGFuZCBhbGwocGllY2UuaXNpZGVudGlmaWVyKCkgZm9yIHBpZWNlIGluIHJvdXRlKToKICAgICAgICAgICAgICAgIGJhc2VzLmFwcGVuZChyb3V0ZSkKICAgIGZvciByb3V0ZSBpbiBiYXNlczoKICAgICAgICBmb3IgaWR4IGluIHJhbmdlKDEsIGxlbihyb3V0ZSkgKyAxKToKICAgICAgICAgICAgbW9kdWxlcy5hZGQoJy4nLmpvaW4ocm91dGVbOmlkeF0pKQogICAgcmV0dXJuIG1vZHVsZXMKCgpkZWYgaW5zdGFsbGVkX3Jvb3QobmFtZSk6CiAgICBpZiBuYW1lIGluIHN5cy5idWlsdGluX21vZHVsZV9uYW1lcyBvciBuYW1lIGluIGdldGF0dHIoc3lzLCAnc3RkbGliX21vZHVsZV9uYW1lcycsICgpKToKICAgICAgICByZXR1cm4gJ3N0YW5kYXJkJwogICAgdHJ5OgogICAgICAgIHNwZWMgPSBpbXBvcnRsaWIubWFjaGluZXJ5LlBhdGhGaW5kZXIuZmluZF9zcGVjKG5hbWUsIHN5cy5wYXRoKQogICAgICAgIGlmIHNwZWMgaXMgbm90IE5vbmU6CiAgICAgICAgICAgIG9yaWdpbiA9IGdldGF0dHIoc3BlYywgJ29yaWdpbicsIE5vbmUpIG9yICcnCiAgICAgICAgICAgIGlmIG9yaWdpbiBpbiAoJ2J1aWx0LWluJywgJ2Zyb3plbicpOgogICAgICAgICAgICAgICAgcmV0dXJuICdzdGFuZGFyZCcKICAgICAgICAgICAgcmV0dXJuICdpbnN0YWxsZWQnCiAgICBleGNlcHQgRXhjZXB0aW9uOgogICAgICAgIHJldHVybiAndW5rbm93bicKICAgIHRyeToKICAgICAgICBzcGVjID0gaW1wb3J0bGliLm1hY2hpbmVyeS5CdWlsdGluSW1wb3J0ZXIuZmluZF9zcGVjKG5hbWUpCiAgICAgICAgaWYgc3BlYyBpcyBub3QgTm9uZToKICAgICAgICAgICAgcmV0dXJuICdzdGFuZGFyZCcKICAgICAgICBzcGVjID0gaW1wb3J0bGliLm1hY2hpbmVyeS5Gcm96ZW5JbXBvcnRlci5maW5kX3NwZWMobmFtZSkKICAgICAgICBpZiBzcGVjIGlzIG5vdCBOb25lOgogICAgICAgICAgICByZXR1cm4gJ3N0YW5kYXJkJwogICAgZXhjZXB0IEV4Y2VwdGlvbjoKICAgICAgICByZXR1cm4gJ3Vua25vd24nCiAgICByZXR1cm4gJ21pc3NpbmcnCgoKZGVmIGNsYXNzaWZ5KG1vZHVsZSwgbW9kdWxlcyk6CiAgICBpZiBub3QgbW9kdWxlOgogICAgICAgIHJldHVybiAndW5rbm93bicKICAgIGlmIG1vZHVsZSBpbiBtb2R1bGVzOgogICAgICAgIHJldHVybiAncHJvamVjdCcKICAgIHJvb3QgPSBtb2R1bGUuc3BsaXQoJy4nKVswXQogICAgaWYgcm9vdCBpbiBtb2R1bGVzOgogICAgICAgIHJldHVybiAnbWlzc2luZycgICMgc3VibW9kdWxlIG5vdCBmb3VuZCBpbiBwcm9qZWN0IGluZGV4CiAgICBmaXJzdCA9IGluc3RhbGxlZF9yb290KHJvb3QpCiAgICBpZiBmaXJzdCBub3QgaW4gKCdzdGFuZGFyZCcsICdpbnN0YWxsZWQnKSBvciAnLicgbm90IGluIG1vZHVsZToKICAgICAgICByZXR1cm4gZmlyc3QKICAgICMgQ2hlY2sgZXhwbGljaXQgZG90dGVkIGltcG9ydHMgd2l0aG91dCBleGVjdXRpbmcgX19pbml0X18ucHkuCiAgICB0cnk6CiAgICAgICAgc3BlYyA9IGltcG9ydGxpYi5tYWNoaW5lcnkuUGF0aEZpbmRlci5maW5kX3NwZWMocm9vdCwgc3lzLnBhdGgpCiAgICAgICAgaWYgc3BlYyBpcyBOb25lOgogICAgICAgICAgICByZXR1cm4gZmlyc3QgaWYgZmlyc3QgPT0gJ3N0YW5kYXJkJyBlbHNlICd1bmtub3duJwogICAgICAgIHByZWZpeCA9IHJvb3QKICAgICAgICBmb3IgcGFydCBpbiBtb2R1bGUuc3BsaXQoJy4nKVsxOl06CiAgICAgICAgICAgIHNlYXJjaCA9IGdldGF0dHIoc3BlYywgJ3N1Ym1vZHVsZV9zZWFyY2hfbG9jYXRpb25zJywgTm9uZSkKICAgICAgICAgICAgaWYgc2VhcmNoIGlzIE5vbmU6CiAgICAgICAgICAgICAgICByZXR1cm4gJ21pc3NpbmcnCiAgICAgICAgICAgIHByZWZpeCArPSAnLicgKyBwYXJ0CiAgICAgICAgICAgIHNwZWMgPSBpbXBvcnRsaWIubWFjaGluZXJ5LlBhdGhGaW5kZXIuZmluZF9zcGVjKHByZWZpeCwgbGlzdChzZWFyY2gpKQogICAgICAgICAgICBpZiBzcGVjIGlzIE5vbmU6CiAgICAgICAgICAgICAgICByZXR1cm4gJ21pc3NpbmcnCiAgICBleGNlcHQgRXhjZXB0aW9uOgogICAgICAgIHJldHVybiAndW5rbm93bicKICAgIHJldHVybiBmaXJzdAoKCmRlZiByZXNvbHZlX3JlbGF0aXZlKHBhdGgsIGxldmVsLCBtb2R1bGUpOgogICAgIiIiUmV0dXJuIGEgbW9kdWxlIGlkZW50aWZpZXIgcmVsYXRpdmUgdG8gdGhlIGZpbGUgcGFja2FnZS4iIiIKICAgIGNvbXBvbmVudHMgPSBub3JtYWxpemUocGF0aCkuc3BsaXQoJy8nKVs6LTFdCiAgICBpZiBjb21wb25lbnRzIGFuZCBjb21wb25lbnRzWzBdIGluICgnc3JjJywgJ2xpYicpOgogICAgICAgIGNvbXBvbmVudHMgPSBjb21wb25lbnRzWzE6XQogICAgaWYgbGV2ZWwgPiBsZW4oY29tcG9uZW50cyk6CiAgICAgICAgcmV0dXJuIE5vbmUKICAgIHBhcmVudCA9IGNvbXBvbmVudHNbOmxlbihjb21wb25lbnRzKSAtIChsZXZlbCAtIDEpXQogICAgaWYgbW9kdWxlOgogICAgICAgIHBhcmVudCArPSBtb2R1bGUuc3BsaXQoJy4nKQogICAgcmV0dXJuICcuJy5qb2luKHBhcmVudCkKCgpkZWYgaW5zcGVjdF9maWxlKG5hbWUsIHNvdXJjZSwgbW9kdWxlcyk6CiAgICBmb3VuZCA9IFtdCiAgICB0cnk6CiAgICAgICAgdHJlZSA9IGFzdC5wYXJzZShzb3VyY2UsIGZpbGVuYW1lPW5hbWUpCiAgICBleGNlcHQgKFN5bnRheEVycm9yLCBWYWx1ZUVycm9yKSBhcyBlcnJvcjoKICAgICAgICByZXR1cm4gW3snZmlsZSc6IG5hbWUsICdsaW5lJzogZXJyb3IubGluZW5vIG9yIDEsICdjb2x1bW4nOiBlcnJvci5vZmZzZXQgb3IgMSwKICAgICAgICAgICAgICAgICAnbmFtZSc6ICcnLCAnc3RhdHVzJzogJ3N5bnRheCcsICdtZXNzYWdlJzogJ0Vycm8gZGUgc2ludGF4ZTogJyArIHN0cihlcnJvci5tc2cpfV0KICAgIGZvciBub2RlIGluIGFzdC53YWxrKHRyZWUpOgogICAgICAgIGlmIGlzaW5zdGFuY2Uobm9kZSwgYXN0LkltcG9ydCk6CiAgICAgICAgICAgIGZvciBhbGlhcyBpbiBub2RlLm5hbWVzOgogICAgICAgICAgICAgICAgdGFyZ2V0ID0gYWxpYXMubmFtZQogICAgICAgICAgICAgICAgc3RhdHVzID0gY2xhc3NpZnkodGFyZ2V0LCBtb2R1bGVzKQogICAgICAgICAgICAgICAgZm91bmQuYXBwZW5kKHsnZmlsZSc6IG5hbWUsICdsaW5lJzogbm9kZS5saW5lbm8sICdjb2x1bW4nOiBub2RlLmNvbF9vZmZzZXQgKyAxLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IHRhcmdldCwgJ3N0YXR1cyc6IHN0YXR1c30pCiAgICAgICAgZWxpZiBpc2luc3RhbmNlKG5vZGUsIGFzdC5JbXBvcnRGcm9tKToKICAgICAgICAgICAgdGFyZ2V0ID0gKCcuJyAqIG5vZGUubGV2ZWwpICsgKG5vZGUubW9kdWxlIG9yICcnKQogICAgICAgICAgICBpZiBub2RlLmxldmVsOgogICAgICAgICAgICAgICAgcmVzb2x2ZWQgPSByZXNvbHZlX3JlbGF0aXZlKG5hbWUsIG5vZGUubGV2ZWwsIG5vZGUubW9kdWxlKQogICAgICAgICAgICAgICAgc3RhdHVzID0gY2xhc3NpZnkocmVzb2x2ZWQsIG1vZHVsZXMpIGlmIHJlc29sdmVkIGVsc2UgJ21pc3NpbmcnCiAgICAgICAgICAgIGVsc2U6CiAgICAgICAgICAgICAgICBzdGF0dXMgPSBjbGFzc2lmeShub2RlLm1vZHVsZSwgbW9kdWxlcykKICAgICAgICAgICAgZm91bmQuYXBwZW5kKHsnZmlsZSc6IG5hbWUsICdsaW5lJzogbm9kZS5saW5lbm8sICdjb2x1bW4nOiBub2RlLmNvbF9vZmZzZXQgKyAxLAogICAgICAgICAgICAgICAgICAgICAgICAgICduYW1lJzogdGFyZ2V0IG9yICcuJywgJ3N0YXR1cyc6IHN0YXR1c30pCiAgICByZXR1cm4gZm91bmQKCgpkZWYgbWFpbigpOgogICAgcGF5bG9hZCA9IGpzb24ubG9hZHMoYmFzZTY0LmI2NGRlY29kZShzeXMuYXJndlsxXSkuZGVjb2RlKCd1dGYtOCcpKSBpZiBsZW4oc3lzLmFyZ3YpID4gMSBlbHNlIHt9CiAgICBzbmFwc2hvdCA9IHt9CiAgICBmb3IgbmFtZSwgdmFsdWUgaW4gcGF5bG9hZC5nZXQoJ3NvdXJjZXMnLCBbXSk6CiAgICAgICAgcGF0aCA9IG5vcm1hbGl6ZShuYW1lKQogICAgICAgIGlmIHBhdGggYW5kIHBhdGgubG93ZXIoKS5lbmRzd2l0aCgnLnB5JykgYW5kIGlzaW5zdGFuY2UodmFsdWUsIHN0cik6CiAgICAgICAgICAgIHNuYXBzaG90W3BhdGhdID0gdmFsdWUKICAgIGxpc3RlZF9uYW1lcyA9IFtuIGZvciBuIGluIChub3JtYWxpemUobmFtZSkgZm9yIG5hbWUgaW4gcGF5bG9hZC5nZXQoJ25hbWVzJywgW10pKSBpZiBuXQogICAgZGlza19za2lwcGVkID0gMAogICAgZGlzayA9IHt9CiAgICBpZiBwYXlsb2FkLmdldCgnc2tpcHBlZCcsIDApIG9yIChub3Qgc25hcHNob3QgYW5kIGxpc3RlZF9uYW1lcyk6CiAgICAgICAgZGlzaywgZGlza19za2lwcGVkID0gY29sbGVjdF9kaXNrX2ZpbGVzKCkKICAgICAgICBpZiBsaXN0ZWRfbmFtZXM6CiAgICAgICAgICAgIGFsbG93ZWQgPSBzZXQobGlzdGVkX25hbWVzKQogICAgICAgICAgICBkaXNrID0ge25hbWU6IHNvdXJjZSBmb3IgbmFtZSwgc291cmNlIGluIGRpc2suaXRlbXMoKSBpZiBuYW1lIGluIGFsbG93ZWR9CiAgICAjIFVuc2F2ZWQgZWRpdG9yIGNvbnRlbnQgYWx3YXlzIG92ZXJyaWRlcyBmaWxlcyBvbiBkaXNrLgogICAgZGlzay51cGRhdGUoc25hcHNob3QpCiAgICBtb2R1bGVzID0gYnVpbGRfbW9kdWxlcyhzZXQoZGlzaykgfCBzZXQobGlzdGVkX25hbWVzKSkKICAgIHNjb3BlID0gcGF5bG9hZC5nZXQoJ3Njb3BlJywgJ3Byb2plY3QnKQogICAgaWYgc2NvcGUgPT0gJ2ZpbGUnOgogICAgICAgIGFjdGl2ZSA9IG5vcm1hbGl6ZShwYXlsb2FkLmdldCgnYWN0aXZlJywgJycpKQogICAgICAgIGRpc2sgPSB7YWN0aXZlOiBkaXNrW2FjdGl2ZV19IGlmIGFjdGl2ZSBpbiBkaXNrIGVsc2Uge30KICAgIHByb2JsZW1zID0gW10KICAgIHJlc3VsdHMgPSBbXQogICAgZm9yIGZpbGVuYW1lIGluIHNvcnRlZChkaXNrKToKICAgICAgICBmb3IgaXRlbSBpbiBpbnNwZWN0X2ZpbGUoZmlsZW5hbWUsIGRpc2tbZmlsZW5hbWVdLCBtb2R1bGVzKToKICAgICAgICAgICAgcmVzdWx0cy5hcHBlbmQoaXRlbSkKICAgICAgICAgICAgaWYgaXRlbVsnc3RhdHVzJ10gaW4gKCdtaXNzaW5nJywgJ3N5bnRheCcpOgogICAgICAgICAgICAgICAgcHJvYmxlbXMuYXBwZW5kKGl0ZW0pCiAgICBhbnN3ZXIgPSB7CiAgICAgICAgJ2N3ZCc6IG9zLmdldGN3ZCgpLCAncHl0aG9uJzogc3lzLmV4ZWN1dGFibGUsCiAgICAgICAgJ3ZlcnNpb24nOiBzeXMudmVyc2lvbi5zcGxpdCgpWzBdLCAnc2NvcGUnOiBzY29wZSwKICAgICAgICAnZmlsZXNDaGVja2VkJzogbGVuKGRpc2spLCAnaW1wb3J0c0NoZWNrZWQnOiBsZW4ocmVzdWx0cyksCiAgICAgICAgJ21pc3NpbmcnOiBsZW4ocHJvYmxlbXMpLCAnc2tpcHBlZERpc2snOiBkaXNrX3NraXBwZWQsCiAgICAgICAgJ3NraXBwZWRTbmFwc2hvdCc6IHBheWxvYWQuZ2V0KCdza2lwcGVkJywgMCksCiAgICAgICAgJ2l0ZW1zJzogcmVzdWx0c1s6NTAwMF0sICd0cnVuY2F0ZWRSZXN1bHRzJzogbWF4KDAsIGxlbihyZXN1bHRzKSAtIDUwMDApCiAgICB9CiAgICBwcmludChQUkVGSVggKyBqc29uLmR1bXBzKGFuc3dlciwgZW5zdXJlX2FzY2lpPUZhbHNlLCBzZXBhcmF0b3JzPSgnLCcsICc6JykpKQoKCmlmIF9fbmFtZV9fID09ICdfX21haW5fXyc6CiAgICB0cnk6CiAgICAgICAgbWFpbigpCiAgICBleGNlcHQgRXhjZXB0aW9uIGFzIGV4YzoKICAgICAgICBwcmludChQUkVGSVggKyBqc29uLmR1bXBzKHsnZmF0YWwnOiBzdHIoZXhjKX0sIGVuc3VyZV9hc2NpaT1GYWxzZSkpCg==';

  function quote(value) {
    return "'" + String(value).replace(/'/g, "'\"'\"'") + "'";
  }

  function encodeBase64Utf8(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    return btoa(binary);
  }

  function fileIsPython(file) {
    return String(file.name || '').toLowerCase().endsWith('.py');
  }

  function assembleSnapshot(api, scope) {
    const files = api.getFiles().filter(fileIsPython);
    const active = api.getActiveFile();
    const selected = scope === 'file' ? files.filter(file => file.name === active?.name) : files;
    const names = [];
    let nameBudget = 18000;
    let omittedNames = 0;
    for (const file of files) {
      const size = new TextEncoder().encode(JSON.stringify(file.name)).length + 1;
      if (size > nameBudget) { omittedNames++; continue; }
      nameBudget -= size;
      names.push(file.name);
    }
    const sources = [];
    let skipped = Math.max(0, selected.length - MAX_FILES) + omittedNames;
    let budget = MAX_SNAPSHOT_BYTES;
    for (const file of selected.slice(0, MAX_FILES)) {
      try {
        const current = api.getFile(file.name);
        if (typeof current?.content !== 'string') { skipped++; continue; }
        const estimate = new TextEncoder().encode(JSON.stringify([file.name, current.content])).length;
        if (estimate > budget) { skipped++; continue; }
        budget -= estimate;
        sources.push([file.name, current.content]);
      } catch (error) {
        skipped++;
        console.warn('[Python Import Checker] Arquivo ignorado:', file.name, error);
      }
    }
    return { names, sources, skipped, scope, active: active?.name || '' };
  }

  function normalizeReport(report) {
    if (!report || report.fatal) {
      throw new Error(report?.fatal || 'O Python retornou uma resposta inválida.');
    }
    if (!Array.isArray(report.items)) throw new Error('Resposta Python sem lista de importações.');
    return report;
  }

  function formatReport(report) {
    const rows = [
      'Python Import Checker',
      `Interpretador: ${report.python} (Python ${report.version})`,
      `Diretório: ${report.cwd}`,
      `Arquivos analisados: ${report.filesChecked}`,
      `Imports analisados: ${report.importsChecked}`,
      `Não encontrados / sintaxe: ${report.missing}`,
    ];
    if (report.skippedDisk || report.skippedSnapshot || report.truncatedResults) {
      rows.push(`ATENÇÃO - análise parcial: disco ${report.skippedDisk || 0}, arquivos via editor ${report.skippedSnapshot || 0}, resultados omitidos ${report.truncatedResults || 0}.`);
    }
    rows.push('');
    const missing = report.items.filter(item => item.status === 'missing' || item.status === 'syntax');
    if (missing.length) {
      rows.push('PROBLEMAS:');
      for (const item of missing.slice(0, 80)) {
        rows.push(`${item.file}:${item.line}:${item.column}  ${item.status === 'syntax' ? item.message : `Módulo não encontrado: ${item.name}`}`);
      }
      if (missing.length > 80) rows.push(`... ${missing.length - 80} problema(s) adicionais.`);
    } else rows.push('Nenhuma importação ausente encontrada nos arquivos analisados.');
    rows.push('', 'STATUS DOS IMPORTS:');
    const counts = {};
    for (const item of report.items) counts[item.status] = (counts[item.status] || 0) + 1;
    for (const [key, count] of Object.entries(counts).sort()) rows.push(`${key}: ${count}`);
    return rows.join('\n');
  }

  CodeEditorAPI.addPlugin({
    id: ID,
    name: 'Python Import Checker',
    activate({ api, addTopbarOption, runTerminalCommand, isTerminalAvailable, registerDiagnostics, registerCommand }) {
      const cache = new Map();
      const sourceCache = new Map();
      let lastReport = null;
      let interpreter = localStorage.getItem('mcode-python-import-checker-interpreter') || 'python3';
      let busy = false;

      const unregisterDiagnostics = registerDiagnostics((code, { fileName, language }) => {
        if (language?.id !== 'python' && !String(fileName).toLowerCase().endsWith('.py')) return [];
        if (sourceCache.has(fileName) && sourceCache.get(fileName) !== code) return [];
        return cache.get(fileName) || [];
      });

      function chooseInterpreter() {
        const entered = window.prompt('Interpretador Python (ex.: python3 ou /sdcard/projeto/.venv/bin/python):', interpreter);
        if (entered === null) return;
        const candidate = entered.trim();
        if (!candidate || /[\n\r\0]/.test(candidate)) {
          window.alert('Informe um nome ou caminho válido para o interpretador.');
          return;
        }
        interpreter = candidate;
        localStorage.setItem('mcode-python-import-checker-interpreter', candidate);
        window.alert(`Interpretador definido: ${candidate}\nA verificação usará os pacotes desse Python.`);
      }

      function showLast() {
        if (!lastReport) return window.alert('Ainda não existe relatório. Escolha "Verificar projeto" primeiro.');
        window.prompt('Relatório (selecione e copie):', formatReport(lastReport));
      }

      function verify(scope) {
        if (busy) return;
        if (!isTerminalAvailable()) {
          window.alert('O serviço de terminal Debian/LunusDroid precisa estar conectado para verificar módulos instalados.');
          return;
        }
        const active = api.getActiveFile();
        if (scope === 'file' && !active?.name?.toLowerCase().endsWith('.py')) {
          window.alert('Abra um arquivo .py antes de verificar o arquivo atual.');
          return;
        }
        busy = true;
        try {
          const payload = assembleSnapshot(api, scope);
          if (scope === 'project' && !payload.names.length) {
            window.alert('Nenhum arquivo .py listado no projeto. Abra a pasta do projeto e tente novamente.');
            return;
          }
          const argument = encodeBase64Utf8(JSON.stringify(payload));
          const executeCode = `import base64;exec(compile(base64.b64decode('${CORE_B64}'),'<mcode-import-checker>','exec'))`;
          // Both arguments are POSIX shell-quoted. No user project code is executed.
          const command = `${quote(interpreter)} -c ${quote(executeCode)} ${quote(argument)}`;
          const result = runTerminalCommand(command);
          const output = String(result?.output || '');
          const marker = output.lastIndexOf(MARKER);
          if (marker < 0) {
            throw new Error(`Não foi possível executar a análise.\n${String(result?.error || output || 'Nenhuma saída do Python').slice(-1200)}`);
          }
          const jsonLine = output.slice(marker + MARKER.length).split(/\r?\n/)[0].trim();
          const report = normalizeReport(JSON.parse(jsonLine));
          lastReport = report;
          cache.clear();
          sourceCache.clear();
          for (const [name, source] of payload.sources) sourceCache.set(name, source);
          for (const item of report.items) {
            if (item.status !== 'missing' && item.status !== 'syntax') continue;
            if (!cache.has(item.file)) cache.set(item.file, []);
            cache.get(item.file).push({
              line: item.line,
              column: item.column,
              message: item.status === 'syntax' ? item.message : `Import não encontrado: ${item.name}`,
              severity: 'warning',
            });
          }
          // Reopen the active file to update the Problems panel without editing its text.
          const current = api.getActiveFile();
          if (current?.name) api.openFile(current.name);
          const text = formatReport(report);
          console.info('[Python Import Checker]\n' + text);
          window.alert(text.slice(0, 6500));
        } catch (error) {
          window.alert('Falha na verificação de imports:\n' + String(error.message || error));
          console.error('[Python Import Checker]', error);
        } finally { busy = false; }
      }

      const menu = {
        id: 'python-import-checker-menu',
        type: 'menu',
        label: 'Verificar imports Python',
        icon: '🐍',
        items: [
          { id: 'check-project', label: 'Verificar projeto', onClick: () => verify('project') },
          { id: 'check-file', label: 'Verificar arquivo atual', onClick: () => verify('file') },
          { id: 'set-python', label: 'Escolher interpretador / venv', onClick: chooseInterpreter },
          { id: 'show-last', label: 'Ver último relatório', onClick: showLast },
        ],
      };
      addTopbarOption(menu, { replace: true });
      registerCommand('check-project', () => verify('project'));
      registerCommand('check-file', () => verify('file'));
      registerCommand('set-python', chooseInterpreter);
      registerCommand('show-last', showLast);
      return () => {
        unregisterDiagnostics();
        api.removeTopbarOption('python-import-checker-menu');
        cache.clear();
        sourceCache.clear();
      };
    },
  });
})();
