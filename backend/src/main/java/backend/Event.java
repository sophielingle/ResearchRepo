package backend;

public class Event {

    private Long id;
    private String title;
    private String date;

    public Event(Long id, String title, String date) {
        this.id = id;
        this.title = title;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDate() {
        return date;
    }
}
