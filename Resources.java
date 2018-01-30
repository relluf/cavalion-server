package com.veldapps.rest;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.net.URLConnection;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.cavalion.util.Utils;
import org.cavalion.util.io.Directory;
import org.cavalion.util.io.InputStream;

@Path("resources")
public class Resources {
    
    public final int MAX_LENGTH = 1024 * 1024 * 5;
    public final String BASE_DIR = "./.navigator/";

    static public class Resource {

        public String text;
        public int position = 0;
        public String revision;

        public Resource() {
        }

    }

    @DELETE
    @Path("{uri:.+}")
    @Produces("application/json")
    public Object delete(@PathParam("uri") String uri) {
        File file = getFile(uri);
        if (!file.exists()) {
            return Response.status(Status.NOT_FOUND).entity(uri).build();
        }

        if (file.isDirectory()) {
            Directory.deleteDirectory(file);
        } else {
            file.delete();
        }

        return Response.status(Status.NO_CONTENT).build();
    }

    @POST
    @Path("{uri:.+}")
    @Consumes("application/json")
    @Produces("application/json")
    public Object post(@PathParam("uri") String uri, /**/
            Resource resource/**/) throws NoSuchAlgorithmException, IOException {

        File file = getFile(uri);
        if (file.exists()) {
            return Response.status(Status.CONFLICT).entity(Utils.mapOf("message", "Resource already exists")).build();
        }

        if (resource.text == null) {
            file.mkdirs();
        } else {
            file.getParentFile().mkdirs();
            FileOutputStream out = new FileOutputStream(file);
            try {
                out.write(resource.text.getBytes());
            } finally {
                out.close();
            }
        }

        return Utils.mapOf("revision", getRevision(file, uri), "size", file.length());
    }

    @PUT
    @Path("{uri:.+}")
    @Consumes("application/json")
    @Produces("application/json")
    public Object put(@PathParam("uri") String uri, /**/
            Resource resource/**/) throws NoSuchAlgorithmException, IOException {

        File file = getFile(uri);
        if (!file.exists()) {
            return Response.status(Status.NOT_FOUND).entity(uri).build();
        }

        if (!getRevision(file, uri).equals(resource.revision)) {
            return Response.status(Status.CONFLICT).entity(Utils.mapOf("message", "Out of date, update working copy"))
                    .build();
        }

        FileOutputStream out = new FileOutputStream(file);
        try {
            out.write(resource.text.getBytes());
        } finally {
            out.close();
        }

        return Utils.mapOf("revision", getRevision(file, uri), "size", file.length());
    }

    @GET
    @Produces("application/json")
    public Object getRoot(@Context HttpServletResponse resp, /**/
            @QueryParam("file") String filename, /**/
            @QueryParam("mime") String mime/**/
    ) throws IOException, NoSuchAlgorithmException {
        return get(resp, "/", "true", null, filename, mime, null, null, null);
    }

    @GET
    @Path("{uri:.+}")
    @Produces("application/json")
    public Object get(@Context HttpServletResponse resp, /**/
            @PathParam("uri") String uri, /**/
            @QueryParam("recursive") String recursive/**/,
            @QueryParam("list") String list, /*- optional, client expects a list */
            @QueryParam("file") String filename, /**/
            @QueryParam("mime") String mime, /**/
            @QueryParam("encoding") String encoding/**/, @QueryParam("position") Integer position, /**/
            @QueryParam("size") Integer size/**/
    ) throws IOException, NoSuchAlgorithmException {

        File file = getFile(uri);

        if (!file.exists()) {
            return Response.status(Status.NOT_FOUND).entity(uri).build();
        }

        if (size != null && size >= MAX_LENGTH) {
            return Response.status(Status.NOT_ACCEPTABLE)
                    .entity(Utils.mapOf("message", String.format("Exceeding maximum size (%d > %d)", size, MAX_LENGTH)))
                    .build();
        }

        if (position != null && position >= file.length()) {
            return Response.status(Status.NOT_ACCEPTABLE).entity(Utils.mapOf("message",
                    String.format("Position exceeds file size (%d > %d)", position, file.length()))).build();
        }

        if (filename != null) {
            /*- This is a download */
            if (mime == null) {
                mime = URLConnection.guessContentTypeFromName(file.getName());
            }
            return Response.ok(file, mime).build();
        }

        if (file.isDirectory() || "false".equals(list) == false) {
            /*- This is a directory / Client expects a list */
            return list(file, uri, "all".equals(list));
        }

        /*- Editor time */
        return asText(file, uri, encoding);
    }

    @GET
    @Produces("application/json")
    @Path("index")
    public Object getIndex(@QueryParam("uris") String uris,
            @DefaultValue("false") @QueryParam("hidden") boolean hidden) {
        if (uris == null) {
            throw new IllegalArgumentException("uris is required");
        }

        Map<String, Object> r = Utils.mapOf();
        String[] uris_ = uris.split(";");

        List<String> dirs = new ArrayList<>();

        for (String uri : uris_) {
            dirs.add(uri);
            if (uri.length() > 0) {
                dirs.addAll(getContents(getFile(uri), uri, true, true));
            }
        }

        for (String dir : dirs) {
            r.put(dir.replaceAll("\\\\", "/"), list(getFile(dir), dir, hidden));
        }

        return r;
    }

    /**
     *
     * @param dir
     * @param recursive
     * @param onlyDirs
     * @return
     */
    private List<String> getContents(File dir, String prefix, boolean recursive, boolean onlyDirs) {
        List<String> list = new ArrayList<>();
        String[] children = dir.list();
        if (children != null) {
            for (String name : children) {
                if (name.charAt(0) != '.') {
                    File file = new File(dir, name);
                    if (onlyDirs == false || file.isDirectory()) {
                        list.add(String.format("%s/%s", prefix, name));
                    }
                    if (recursive && file.isDirectory()) {
                        list.addAll(getContents(file, String.format("%s/%s", prefix, file.getName()), true, onlyDirs));
                    }
                }
            }
        }
        return list;
    }

    private String getRevision(File file, String uri) throws NoSuchAlgorithmException, UnsupportedEncodingException {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md
                .digest(String.format("/stuv/rest/resources/%s-%d", uri, file.lastModified()).getBytes("UTF-8"));

        BigInteger bigInt = new BigInteger(1, digest);
        String revision = bigInt.toString(16);
        while (revision.length() < 32) {
            revision = "0" + revision;
        }
        return revision;
    }

    private Object asText(File file, String uri, String encoding) throws IOException, NoSuchAlgorithmException {
        FileInputStream in = new FileInputStream(file);
        try {
            return Utils.mapOf("text", InputStream.slurp(in), "revision", getRevision(file, uri), "position", 0, "size",
                    file.length());
        } finally {
            in.close();
        }
    }

    private Object list(File parent, String uri, boolean listAll) {
        List<Map<String, Object>> list = Utils.listOf();
        String[] names = parent.list();

        if (!uri.endsWith("/")) {
            uri += "/";
        }

        if (names != null) {
            for (String name : names) {
                File file = new File(parent, name);
                String type = file.isDirectory() ? "Folder" : "Resource";
                if (listAll || !file.isHidden()) {
                    list.add(Utils.mapOf("name", name, "type", type, "size", file.length(), "modified",
                            file.lastModified(), "created", null));
                }
            }
        }
        return list;
    }

    private File getFile(String uri) {
        return new File(BASE_DIR + uri);
    }

    /**
     *
     * @param resp
     * @param file
     * @param filename
     * @param mime
     * @return
     * @throws IOException
     */
    private Object download(HttpServletResponse resp, File file, String filename, String mime) throws IOException {

        FileInputStream is = new FileInputStream(file);

        try {
            if (mime == null) {
                mime = URLConnection.guessContentTypeFromName(file.getName());
            }
            resp.setContentType(mime);
            InputStream.toOutputStream(is, resp.getOutputStream(), 1024 * 1024 * 8);
        } finally {
            is.close();
        }
        return null;
    }

}
